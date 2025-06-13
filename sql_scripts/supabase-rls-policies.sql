-- =============================================
-- CarGopher Row-Level Security (RLS) Policies
-- Execute these AFTER creating the tables
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES TABLE POLICIES
-- =============================================

-- Allow public read access to profiles (for displaying owner info, etc.)
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- CARS TABLE POLICIES
-- =============================================

-- Allow public read access to cars (browse functionality)
CREATE POLICY "Cars are viewable by everyone" ON public.cars
    FOR SELECT USING (true);

-- Only car owners can insert cars
CREATE POLICY "Only owners can insert cars" ON public.cars
    FOR INSERT WITH CHECK (
        auth.uid() = owner_id AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Only car owners can update their own cars
CREATE POLICY "Owners can update their own cars" ON public.cars
    FOR UPDATE USING (auth.uid() = owner_id);

-- Only car owners can delete their own cars
CREATE POLICY "Owners can delete their own cars" ON public.cars
    FOR DELETE USING (auth.uid() = owner_id);

-- =============================================
-- BOOKINGS TABLE POLICIES
-- =============================================

-- Customers can see their own bookings, owners can see bookings for their cars
CREATE POLICY "Users can view relevant bookings" ON public.bookings
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        auth.uid() IN (
            SELECT owner_id FROM public.cars WHERE id = car_id
        )
    );

-- Only customers can create bookings for themselves
CREATE POLICY "Customers can create their own bookings" ON public.bookings
    FOR INSERT WITH CHECK (
        auth.uid() = customer_id AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'customer'
        )
    );

-- Complex update policy for booking status management
CREATE POLICY "Booking status updates" ON public.bookings
    FOR UPDATE USING (
        -- Customers can cancel their own pending bookings
        (auth.uid() = customer_id AND status = 'pending' AND status IN ('cancelled')) OR
        
        -- Car owners can update status of bookings for their cars
        (auth.uid() IN (
            SELECT owner_id FROM public.cars WHERE id = car_id
        ) AND status IN ('pending') AND status IN ('upcoming', 'rejected'))
    );

-- =============================================
-- REVIEWS TABLE POLICIES
-- =============================================

-- Reviews are publicly viewable
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);

-- Only customers can create reviews for their own completed bookings
CREATE POLICY "Customers can create reviews for completed bookings" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() = customer_id AND
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE id = booking_id 
            AND customer_id = auth.uid() 
            AND status = 'completed'
        )
    );

-- Customers can update their own reviews
CREATE POLICY "Customers can update their own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = customer_id);

-- Customers can delete their own reviews
CREATE POLICY "Customers can delete their own reviews" ON public.reviews
    FOR DELETE USING (auth.uid() = customer_id);

-- =============================================
-- WISHLISTS TABLE POLICIES
-- =============================================

-- Users can only see their own wishlist
CREATE POLICY "Users can view their own wishlist" ON public.wishlists
    FOR SELECT USING (auth.uid() = customer_id);

-- Users can add to their own wishlist
CREATE POLICY "Users can add to their own wishlist" ON public.wishlists
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Users can remove from their own wishlist
CREATE POLICY "Users can remove from their own wishlist" ON public.wishlists
    FOR DELETE USING (auth.uid() = customer_id);