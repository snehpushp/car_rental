import { NextRequest } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  requireAuth
} from '@/lib/utils/api-helpers';
import { HttpStatus } from '@/lib/types/api';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;
    
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return createErrorResponse('No file provided', HttpStatus.BAD_REQUEST);
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse('Invalid file type. Only JPEG, PNG, and WebP are allowed', HttpStatus.BAD_REQUEST);
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return createErrorResponse('File size too large. Maximum size is 5MB', HttpStatus.BAD_REQUEST);
    }
    
    const supabase = await getSupabaseRouteHandler();
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${auth.profile.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true
      });
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return createErrorResponse('Failed to upload avatar', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    if (!urlData?.publicUrl) {
      return createErrorResponse('Failed to get avatar URL', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    // Update profile with new avatar URL
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', auth.profile.id)
      .select('*')
      .single();
    
    if (updateError) {
      console.error('Database error:', updateError);
      return createErrorResponse('Failed to update profile with new avatar', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    // Delete old avatar if it exists and is different
    if (auth.profile.avatar_url && auth.profile.avatar_url !== urlData.publicUrl) {
      try {
        // Extract old file path from URL
        const oldUrl = new URL(auth.profile.avatar_url);
        const oldPath = oldUrl.pathname.split('/').slice(-2).join('/'); // Get 'avatars/filename.ext'
        
        await supabase.storage
          .from('avatars')
          .remove([oldPath]);
      } catch (error) {
        // Log but don't fail the request if old file deletion fails
        console.warn('Failed to delete old avatar:', error);
      }
    }
    
    return createSuccessResponse({
      avatar_url: urlData.publicUrl,
      profile: updatedProfile
    }, 'Avatar uploaded successfully');
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
} 