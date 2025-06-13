-- =============================================
-- Supabase Storage RLS Policies
-- =============================================

-- Note: Bucket creation must be done via the Supabase dashboard or management API.
-- Public buckets for avatars and car images are assumed.

-- =============================================
-- AVATARS BUCKET POLICIES
-- =============================================

-- Allow public read access to avatars
CREATE POLICY "Avatars are publicly viewable"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Users can upload their own avatar into a folder named with their user ID.
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own avatar.
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatar.
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);


-- =============================================
-- CAR IMAGES BUCKET POLICIES
-- =============================================

-- Allow public read access to car images
CREATE POLICY "Car images are publicly viewable"
ON storage.objects FOR SELECT
USING ( bucket_id = 'car-images' );

-- Owners can upload car images into a folder named with their user ID.
CREATE POLICY "Owners can upload car images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'car-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- Owners can update their car images.
CREATE POLICY "Owners can update car images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'car-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- Owners can delete their car images.
CREATE POLICY "Owners can delete their car images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'car-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'owner'
  )
);
