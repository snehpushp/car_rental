'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Car, Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
              <Car className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight">
              CarGopher
            </span>
          </div>
        </div>

        {/* 404 Illustration */}
        <div className="space-y-4">
          <div className="text-6xl font-bold text-gray-300">404</div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Page Not Found
          </h1>
          <p className="text-gray-600 max-w-sm mx-auto">
            This page is currently not developed yet or the URL is incorrect. Please check the URL or navigate back to explore our available features.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Go Home</span>
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cars" className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Browse Cars</span>
              </Link>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Button>
        </div>

        {/* Help Text */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">Contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 