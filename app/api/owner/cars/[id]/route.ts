import { NextRequest } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  requireRole
} from '@/lib/utils/api-helpers';
import { uuidSchema, carUpdateSchema } from '@/lib/validation/schemas';
import type { Car } from '@/lib/types/database';
import { HttpStatus, ErrorMessages } from '@/lib/types/api';

interface RouteParams {
  params: { id: string };
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Require owner role
    const auth = await requireRole('owner');
    if (auth instanceof Response) return auth;
    
    // Validate car ID
    const carId = uuidSchema.parse(params.id);
    
    const body = await request.json();
    const updateData = carUpdateSchema.parse(body);
    
    const supabase = await getSupabaseRouteHandler();
    
    // First, verify the car exists and belongs to the owner
    const { data: existingCar, error: fetchError } = await supabase
      .from('cars')
      .select('id, owner_id')
      .eq('id', carId)
      .eq('owner_id', auth.profile.id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      console.error('Database error:', fetchError);
      return createErrorResponse('Failed to fetch car', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (!existingCar) {
      return createErrorResponse(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    
    // Update the car
    const { data: updatedCar, error: updateError } = await supabase
      .from('cars')
      .update(updateData)
      .eq('id', carId)
      .select('*')
      .single();
    
    if (updateError) {
      console.error('Database error:', updateError);
      return createErrorResponse('Failed to update car', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    return createSuccessResponse(updatedCar, 'Car updated successfully');
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const auth = await requireRole('owner');
    if (auth instanceof Response) return auth;

    const carId = uuidSchema.parse(params.id);
    const body = await request.json();
    
    // We only expect `is_available` in the body for this endpoint
    if (typeof body.is_available !== 'boolean') {
      return createErrorResponse('Invalid request body. "is_available" (boolean) is required.', HttpStatus.BAD_REQUEST);
    }

    const supabase = await getSupabaseRouteHandler();

    const { data: updatedCar, error } = await supabase
      .from('cars')
      .update({ is_available: body.is_available })
      .eq('id', carId)
      .eq('owner_id', auth.profile.id)
      .select('id, is_available')
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // PostgREST error for no rows found
        return createErrorResponse(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      console.error('Database error:', error);
      return createErrorResponse('Failed to update car availability', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (!updatedCar) {
        return createErrorResponse(ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return createSuccessResponse(updatedCar, `Car has been successfully ${body.is_available ? 'listed' : 'unlisted'}.`);

  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Require owner role
    const auth = await requireRole('owner');
    if (auth instanceof Response) return auth;
    
    // Validate car ID
    const carId = uuidSchema.parse(params.id);
    
    const supabase = await getSupabaseRouteHandler();
    
    // Check if car has any active bookings
    const { data: activeBookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('car_id', carId)
      .in('status', ['pending', 'upcoming', 'ongoing']);
    
    if (bookingError) {
      console.error('Database error:', bookingError);
      return createErrorResponse('Failed to check car bookings', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    if (activeBookings && activeBookings.length > 0) {
      return createErrorResponse(
        'Cannot delete car with active bookings. Please wait for all bookings to be completed or cancelled.',
        HttpStatus.BAD_REQUEST
      );
    }
    
    // Delete the car (this will also cascade delete related bookings/reviews due to FK constraints)
    const { error: deleteError } = await supabase
      .from('cars')
      .delete()
      .eq('id', carId)
      .eq('owner_id', auth.profile.id);
    
    if (deleteError) {
      console.error('Database error:', deleteError);
      return createErrorResponse('Failed to delete car', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    return createSuccessResponse(null, 'Car deleted successfully');
    
  } catch (error) {
    console.error('API Error:', error);
    return handleApiError(error);
  }
} 