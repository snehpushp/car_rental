-- =============================================
-- CarGopher Database Schema Setup Scripts
-- Execute these in your Supabase SQL Editor
-- =============================================

-- Script 1: Create profiles table
-- This extends the default auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('customer', 'owner'))
);

-- Script 2: Create cars table
-- Stores all car listings from owners
CREATE TABLE IF NOT EXISTS public.cars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(year FROM NOW()) + 1),
    type TEXT NOT NULL CHECK (type IN ('sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'truck', 'van')),
    fuel_type TEXT NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid')),
    transmission TEXT NOT NULL CHECK (transmission IN ('manual', 'automatic')),
    price_per_day DECIMAL(10,2) NOT NULL CHECK (price_per_day > 0),
    image_urls TEXT[] DEFAULT '{}',
    location_text TEXT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude DECIMAL(11,8) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    description TEXT,
    specs JSONB DEFAULT '{}',
    is_available BOOLEAN DEFAULT true NOT NULL
);

-- Script 3: Create bookings table
-- Stores all rental bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price > 0),
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'rejected', 'cancelled', 'upcoming', 'ongoing', 'completed')),
    rejection_reason TEXT,
    CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Script 4: Create reviews table
-- Stores customer reviews for cars
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(booking_id) -- One review per booking
);

-- Script 5: Create wishlists table (optional)
-- Stores customer's saved/favorite cars
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(customer_id, car_id) -- Prevent duplicate wishlist entries
);

-- Script 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cars_owner_id ON public.cars(owner_id);
CREATE INDEX IF NOT EXISTS idx_cars_location ON public.cars(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_cars_available ON public.cars(is_available);
CREATE INDEX IF NOT EXISTS idx_cars_price ON public.cars(price_per_day);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON public.bookings(car_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_car_id ON public.reviews(car_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_customer_id ON public.wishlists(customer_id);

-- Script 7: Create functions for automatic profile creation
-- This function automatically creates a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Script 8: Create function to update booking status based on dates
-- This function can be called periodically to update booking statuses
CREATE OR REPLACE FUNCTION public.update_booking_statuses()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
  temp_count INTEGER := 0;
BEGIN
  -- Update upcoming bookings to ongoing if start date is today or past
  UPDATE public.bookings 
  SET status = 'ongoing'
  WHERE status = 'upcoming' 
    AND start_date <= CURRENT_DATE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Update ongoing bookings to completed if end date is past
  UPDATE public.bookings 
  SET status = 'completed'
  WHERE status = 'ongoing' 
    AND end_date < CURRENT_DATE;
  
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  
  -- Add the counts together
  updated_count := updated_count + temp_count;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;