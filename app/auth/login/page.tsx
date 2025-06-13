import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { AuthSlideshow } from '@/components/auth/auth-slideshow';
import { Car } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Left Column - Slideshow (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-3/5 xl:w-2/3">
          <AuthSlideshow />
        </div>

        {/* Right Column - Login Form */}
        <div className="flex-1 lg:w-2/5 xl:w-1/3 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-sm">
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center space-x-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center bg-foreground text-background">
                  <Car className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-foreground">CarGopher</span>
              </Link>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            {/* Login Form */}
            <div className="space-y-6">
              <LoginForm />
              
              {/* Sign up link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link 
                    href="/auth/signup" 
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </div>

            {/* Mobile Feature Preview (Only visible on mobile) */}
            <div className="lg:hidden mt-12 pt-8 border-t border-border">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Find Your Perfect Ride
                </h3>
                <p className="text-sm text-muted-foreground">
                  Browse thousands of cars from trusted hosts in your area.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 