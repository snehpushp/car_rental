'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Car, Users, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const slides = [
  {
    id: 1,
    icon: <Car className="h-8 w-8 text-white" />,
    title: "Find Your Perfect Ride",
    description: "Browse thousands of cars from trusted hosts in your area. From economy to luxury, find the perfect vehicle for any occasion.",
    image: "https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
  },
  {
    id: 2,
    icon: <Users className="h-8 w-8 text-white" />,
    title: "Earn Money Sharing Your Car",
    description: "Turn your idle car into income. List your vehicle and start earning money from other drivers in your community.",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80"
  },
  {
    id: 3,
    icon: <Shield className="h-8 w-8 text-white" />,
    title: "Safe & Secure Platform",
    description: "Every trip is protected with comprehensive insurance coverage and 24/7 customer support for peace of mind.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
  },
  {
    id: 4,
    icon: <Clock className="h-8 w-8 text-white" />,
    title: "Book Instantly",
    description: "Skip the rental counter. Book instantly, unlock with your phone, and start your journey in minutes.",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80"
  }
];

export function AuthSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={slides[currentSlide].image}
          alt={slides[currentSlide].title}
          fill
          className="object-cover transition-all duration-1000 ease-in-out"
          priority
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>
      
      {/* Content - Bottom Center */}
      <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 xl:p-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              {slides[currentSlide].icon}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
            {slides[currentSlide].title}
          </h2>

          {/* Description */}
          <p className="text-lg lg:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
            {slides[currentSlide].description}
          </p>

          {/* Navigation Dots */}
          <div className="flex justify-center space-x-3 pt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-white/40 w-2 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-6 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 transition-all duration-200"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="absolute inset-y-0 right-6 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 transition-all duration-200"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Slide Counter */}
      <div className="absolute top-6 right-6">
        <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
          <span className="text-white text-sm font-medium">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </div>
    </div>
  );
} 