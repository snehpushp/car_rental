'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images?.[0] || '/images/placeholder-car.png');

  return (
    <div className="mb-8">
      <div className="mb-4 overflow-hidden rounded-lg">
        <Image
          src={selectedImage}
          alt="Selected car image"
          width={800}
          height={500}
          className="h-auto w-full object-cover aspect-video"
        />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className={cn(
              'overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              selectedImage === image && 'ring-2 ring-primary ring-offset-2'
            )}
          >
            <Image
              src={image}
              alt={`Car image thumbnail ${index + 1}`}
              width={150}
              height={100}
              className="h-full w-full object-cover aspect-video"
            />
          </button>
        ))}
      </div>
    </div>
  );
} 