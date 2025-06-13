'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Car, Home, Search, RefreshCw, AlertTriangle, Bug, ArrowLeft } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  const handleReportError = () => {
    // In a real application, you would send this to your error tracking service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    console.log('Error report:', errorReport);
    // Example: Send to error tracking service
    // errorTrackingService.report(errorReport);
  };

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

        {/* Error Illustration */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Something went wrong
          </h1>
          <p className="text-gray-600 max-w-sm mx-auto">
            We encountered an unexpected error. Please try again later or navigate back to explore our available features.
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
            <h3 className="text-sm font-medium text-red-800 mb-2">Error Details (Development)</h3>
            <p className="text-xs text-red-700 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-1">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={reset}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Go Home</span>
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link href="/cars" className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Browse Cars</span>
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleGoBack}
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={handleReportError}
            className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
          >
            <Bug className="h-4 w-4" />
            <span>Report Issue</span>
          </Button>
        </div>

        {/* Help Text */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If the problem persists, please <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 