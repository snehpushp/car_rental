import { Car, Loader2 } from 'lucide-react';

export default function Loading() {
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

        {/* Loading Spinner */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <p className="text-gray-600">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
} 