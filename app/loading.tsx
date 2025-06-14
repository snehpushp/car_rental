import { Car, Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20 flex items-center justify-center px-6 sm:px-8 lg:px-12 theme-transition">
      <div className="max-w-2xl w-full space-y-12 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 shadow-lg shadow-primary/25">
              <Car className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="font-montserrat text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              CarGopher
            </span>
          </div>
        </div>

        {/* Loading Content */}
        <div className="space-y-8">
          {/* Loading Spinner */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 animate-pulse" />
              <Loader2 className="relative h-12 w-12 animate-spin text-primary" />
            </div>
          </div>
          
          {/* Loading Text */}
          <div className="space-y-4">
            <h1 className="font-montserrat text-2xl font-bold text-foreground sm:text-3xl">
              Loading...
            </h1>
            <p className="font-poppins text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Getting your perfect ride ready
            </p>
          </div>
          
          {/* Loading Progress Indicator */}
          <div className="space-y-3">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Please wait while we prepare your experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 