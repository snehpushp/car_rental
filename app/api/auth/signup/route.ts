import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseRouteHandler, getSupabaseServiceRole } from '@/lib/supabase/server';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['customer', 'owner'], {
    errorMap: () => ({ message: 'Role must be either customer or owner' })
  })
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseRouteHandler();
    
    // Parse and validate request body
    const body = await request.json();
    const result = signupSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      );
    }

    const { email, password, fullName, role } = result.data;

    // Create user in Supabase Auth (profile will be auto-created by trigger)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      
      // Handle specific auth errors
      let errorMessage = authError.message;
      if (authError.message.includes('email_address_invalid')) {
        errorMessage = 'Please enter a valid email address';
      } else if (authError.message.includes('signup_disabled')) {
        errorMessage = 'Account registration is currently disabled';
      } else if (authError.message.includes('email_address_not_authorized')) {
        errorMessage = 'This email address is not authorized to sign up';
      } else if (authError.message.includes('User already registered')) {
        errorMessage = 'An account with this email already exists';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // If user was created but we need to update profile data
    // (in case trigger didn't work or we need to ensure data consistency)
    try {
      const serviceRole = getSupabaseServiceRole();
      
      // Update profile with correct data (upsert to handle any edge cases)
      const { error: profileError } = await serviceRole
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: fullName,
          role: role,
          avatar_url: null
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile update error:', profileError);
        // Don't fail the signup for profile update errors since trigger should handle it
      }
    } catch (profileUpdateError) {
      console.error('Profile update failed:', profileUpdateError);
      // Continue anyway since the trigger should have created the profile
    }

    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName,
        role
      },
      requiresVerification: !authData.session
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
} 