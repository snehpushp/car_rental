import { z } from 'zod';

// Car validation schemas
export const carCreateSchema = z.object({
  brand: z.string().min(1, 'Brand is required').max(50, 'Brand must be less than 50 characters'),
  model: z.string().min(1, 'Model is required').max(50, 'Model must be less than 50 characters'),
  year: z.number().int().min(1900, 'Year must be 1900 or later').max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  type: z.enum(['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'truck', 'van'], {
    errorMap: () => ({ message: 'Invalid car type' })
  }),
  fuel_type: z.enum(['petrol', 'diesel', 'electric', 'hybrid'], {
    errorMap: () => ({ message: 'Invalid fuel type' })
  }),
  transmission: z.enum(['manual', 'automatic'], {
    errorMap: () => ({ message: 'Invalid transmission type' })
  }),
  price_per_day: z.number().positive('Price per day must be positive'),
  location_text: z.string().min(1, 'Location is required'),
  latitude: z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
  longitude: z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
  description: z.string().optional(),
  specs: z.record(z.any()).optional(),
  image_urls: z.array(z.string().url('Invalid image URL')).optional(),
});

export const carUpdateSchema = carCreateSchema.partial();

export const carFiltersSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  fuel_type: z.enum(['petrol', 'diesel', 'electric', 'hybrid']).optional(),
  type: z.enum(['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'truck', 'van']).optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  transmission: z.enum(['manual', 'automatic']).optional(),
  year_min: z.number().int().min(1900).optional(),
  year_max: z.number().int().max(new Date().getFullYear() + 1).optional(),
  search: z.string().optional(),
  sort_by: z.enum(['price_asc', 'price_desc', 'year_desc', 'year_asc', 'rating_desc', 'created_desc']).optional(),
  location: z.string().optional(),
  radius: z.number().positive().optional(),
});

// Booking validation schemas
export const bookingCreateSchema = z.object({
  car_id: z.string().uuid('Invalid car ID'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
}).refine((data) => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return start >= today && end > start;
}, {
  message: 'Start date must be today or later, and end date must be after start date',
  path: ['date_range']
});

export const bookingStatusUpdateSchema = z.object({
  status: z.enum(['upcoming', 'rejected'], {
    errorMap: () => ({ message: 'Status can only be updated to upcoming or rejected' })
  }),
  rejection_reason: z.string().optional(),
}).refine((data) => {
  if (data.status === 'rejected' && !data.rejection_reason) {
    return false;
  }
  return true;
}, {
  message: 'Rejection reason is required when rejecting a booking',
  path: ['rejection_reason']
});

// Review validation schemas
export const reviewCreateSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000, 'Comment must be less than 1000 characters').optional(),
});

// Profile validation schemas
export const profileUpdateSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100, 'Full name must be less than 100 characters').optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
});

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(50).optional().default(10),
});

// ID parameter validation
export const uuidSchema = z.string().uuid('Invalid ID format');

// Date parameter validation
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

// Query parameters validation helper
export function validateQueryParams<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): T {
  const params: Record<string, any> = {};
  
  for (const [key, value] of searchParams.entries()) {
    // Handle numeric parameters
    if (['page', 'limit', 'min_price', 'max_price', 'year_min', 'year_max', 'radius'].includes(key)) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        params[key] = num;
      }
    } else {
      params[key] = value;
    }
  }
  
  return schema.parse(params);
} 