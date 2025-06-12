import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Welcome to{' '}
            <span className="text-primary">CarGopher</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your premium car rental platform. Discover amazing vehicles from verified owners 
            or list your car and start earning today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/cars">Browse Cars</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>For Renters</CardTitle>
                <CardDescription>
                  Find the perfect car for any occasion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Browse verified vehicles</li>
                  <li>• Instant booking</li>
                  <li>• 24/7 support</li>
                  <li>• Insurance included</li>
                </ul>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link href="/auth/signup?role=customer">Sign Up as Customer</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>For Car Owners</CardTitle>
                <CardDescription>
                  Turn your car into a source of income
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• List your car easily</li>
                  <li>• Set your own prices</li>
                  <li>• Comprehensive insurance</li>
                  <li>• Manage bookings</li>
                </ul>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link href="/auth/signup?role=owner">Sign Up as Owner</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Authentication Demo</CardTitle>
                <CardDescription>
                  Test the authentication system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  The authentication system supports role-based access control with customer and owner roles.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
