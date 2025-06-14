'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images?: string[];
}

export function ImageGallery({ images = [] }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(() => {
    return (images && images.length > 0) ? images[0] : '/images/placeholder-car.png';
  });

  return (
    <div className="space-y-6">
      {/* Main Image - Shopify style */}
      <div className="relative aspect-square overflow-hidden bg-card border border-border">
        <Image
          src={selectedImage}
          alt="Selected car image"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      
      {/* Thumbnail Grid - Shopify style */}
      {images && images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.slice(0, 8).map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className={cn(
                'relative aspect-square overflow-hidden bg-card border transition-all duration-200',
                selectedImage === image 
                  ? 'border-foreground ring-1 ring-foreground' 
                  : 'border-border hover:border-muted-foreground'
              )}
            >
              <Image
                src={image}
                alt={`Car image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 12.5vw"
              />
            </button>
          ))}
          
          {/* Show more indicator if more than 8 images */}
          {images && images.length > 8 && (
            <div className="relative aspect-square bg-muted border border-border flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">
                +{images.length - 8}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 