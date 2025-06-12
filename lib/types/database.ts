export type UserRole = 'customer' | 'owner';
export type BookingStatus = 'pending' | 'rejected' | 'cancelled' | 'upcoming' | 'ongoing' | 'completed';
export type CarType = 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'convertible' | 'wagon' | 'truck' | 'van';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid';
export type TransmissionType = 'manual' | 'automatic';

export interface Profile {
  id: string;
  created_at: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
}

export interface Car {
  id: string;
  created_at: string;
  owner_id: string;
  brand: string;
  model: string;
  year: number;
  type: CarType;
  fuel_type: FuelType;
  transmission: TransmissionType;
  price_per_day: number;
  image_urls: string[];
  location_text: string;
  latitude: number;
  longitude: number;
  description: string | null;
  specs: Record<string, any>;
  is_available: boolean;
  // Joined data
  owner?: Profile;
  reviews?: Review[];
  average_rating?: number;
  total_reviews?: number;
}

export interface Booking {
  id: string;
  created_at: string;
  customer_id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: BookingStatus;
  rejection_reason: string | null;
  // Joined data
  customer?: Profile;
  car?: Car;
}

export interface Review {
  id: string;
  created_at: string;
  customer_id: string;
  car_id: string;
  rating: number;
  comment: string | null;
  booking_id: string;
  // Joined data
  customer?: Profile;
  car?: Car;
  booking?: Booking;
}

export interface Wishlist {
  id: string;
  customer_id: string;
  car_id: string;
  created_at: string;
  // Joined data
  car?: Car;
}

// API Request/Response types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CarFilters {
  brand?: string;
  model?: string;
  fuel_type?: FuelType;
  type?: CarType;
  min_price?: number;
  max_price?: number;
  transmission?: TransmissionType;
  year_min?: number;
  year_max?: number;
  search?: string;
  sort_by?: 'price_asc' | 'price_desc' | 'year_desc' | 'year_asc' | 'rating_desc' | 'created_desc';
  location?: string;
  radius?: number; // for location-based filtering
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface BookingCreateRequest {
  car_id: string;
  start_date: string;
  end_date: string;
}

export interface CarCreateRequest {
  brand: string;
  model: string;
  year: number;
  type: CarType;
  fuel_type: FuelType;
  transmission: TransmissionType;
  price_per_day: number;
  location_text: string;
  latitude: number;
  longitude: number;
  description?: string;
  specs?: Record<string, any>;
  image_urls?: string[];
}

export interface ReviewCreateRequest {
  booking_id: string;
  rating: number;
  comment?: string;
} 