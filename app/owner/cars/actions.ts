'use server';

import { z } from 'zod';
import { carFormSchema } from '@/lib/validation/schemas';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type CarFormValues = z.infer<typeof carFormSchema>;

// A simple (and not very robust) geocoding function.
// In a real app, you'd use a proper geocoding service like Google Maps Geocoding API.
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number }> {
    // This is a placeholder. Replace with a real geocoding API call.
    // For now, returning fixed coordinates for demonstration.
    console.warn("Geocoding is not implemented. Using placeholder coordinates.");
    return { lat: 34.0522, lon: -118.2437 }; 
}


async function uploadImages(files: File[], ownerId: string): Promise<string[]> {
    const supabase = createClient();
    const imageUrls: string[] = [];
    for (const file of files) {
        const filePath = `${ownerId}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from('car-images').upload(filePath, file);
        if (error) {
            console.error('Image upload error:', error);
            throw new Error(`Failed to upload ${file.name}.`);
        }
        const { data } = supabase.storage.from('car-images').getPublicUrl(filePath);
        imageUrls.push(data.publicUrl);
    }
    return imageUrls;
}

export async function createCarAction(values: CarFormValues) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required.");

    const validatedFields = carFormSchema.safeParse(values);
    if (!validatedFields.success) {
        throw new Error("Invalid form data.");
    }

    const { image_files, location_text, ...rest } = validatedFields.data;

    try {
        const imageUrls = await uploadImages(image_files, user.id);
        const { lat, lon } = await geocodeAddress(location_text);

        const { error } = await supabase.from('cars').insert({
            ...rest,
            owner_id: user.id,
            image_urls: imageUrls,
            location_text: location_text,
            latitude: lat,
            longitude: lon,
            is_available: true,
        });

        if (error) {
            console.error("Failed to create car:", error);
            throw new Error('Database error: Could not create car.');
        }

        revalidatePath('/owner/cars');

    } catch (error) {
        throw error; // Re-throw the original error
    }
}

export async function updateCarAction(carId: string, values: CarFormValues) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required.");

    const validatedFields = carFormSchema.safeParse(values);
    if (!validatedFields.success) {
        throw new Error("Invalid form data.");
    }
    
    // In an update, image_files might be empty if the user isn't changing them.
    const { image_files, location_text, ...rest } = validatedFields.data;

    try {
        let imageUrls = values.image_urls || [];
        if (image_files && image_files.length > 0) {
            const newImageUrls = await uploadImages(image_files, user.id);
            imageUrls = [...imageUrls, ...newImageUrls];
        }

        const { lat, lon } = await geocodeAddress(location_text);
        
        const { error } = await supabase
            .from('cars')
            .update({
                ...rest,
                image_urls: imageUrls,
                location_text: location_text,
                latitude: lat,
                longitude: lon,
            })
            .eq('id', carId)
            .eq('owner_id', user.id);

        if (error) {
            console.error("Failed to update car:", error);
            throw new Error('Database error: Could not update car.');
        }

        revalidatePath('/owner/cars');
        revalidatePath(`/owner/cars/edit/${carId}`);

    } catch (error) {
        throw error;
    }
} 