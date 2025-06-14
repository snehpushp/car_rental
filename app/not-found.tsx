import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft, AlertCircle } from 'lucide-react';
import { GoBackButton } from '@/components/shared/go-back-button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20 flex items-center justify-center px-6 sm:px-8 lg:px-12 theme-transition">
      <div className="max-w-2xl w-full space-y-12 text-center">
        

        {/* 404 Content */}
        <div className="space-y-8">
          {/* 404 Illustration */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="text-8xl font-black text-muted/20 font-montserrat sm:text-9xl">
                  404
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <AlertCircle className="h-16 w-16 text-muted-foreground/50" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="font-montserrat text-3xl font-bold text-foreground sm:text-4xl">
                Page Not Found
              </h1>
              <p className="font-poppins text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                This page is currently not developed yet or the URL is incorrect. Please check the URL or navigate back to explore our available features.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg"
                className="font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/25 text-primary-foreground"
              >
                <Link href="/" className="flex items-center space-x-2">
                  <Home className="h-5 w-5" />
                  <span>Go Home</span>
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                asChild
                className="font-medium border-2 hover:bg-muted/50"
              >
                <Link href="/cars" className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Browse Cars</span>
                </Link>
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GoBackButton />
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="pt-8 border-t border-border/50">
          <div className="bg-muted/30 rounded-2xl p-6 space-y-4">
            <h3 className="font-montserrat text-lg font-semibold text-foreground">
              Need Help?
            </h3>
            <p className="font-poppins text-muted-foreground">
              If you're having trouble finding what you're looking for, our support team is here to help.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Contact Support
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 