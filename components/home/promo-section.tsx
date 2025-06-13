import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Users, Wallet } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
      icon: <Wallet className="h-10 w-10 text-foreground" />,
      title: 'Become a Host',
      description: 'Turn your car into an income source by listing it on our platform. We provide the tools and support to make it easy.',
      href: '/auth/signup?role=owner',
      cta: 'Start Earning',
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-foreground" />,
      title: 'Safe & Insured',
      description: 'We verify all users and provide comprehensive insurance coverage for every trip, so you can have peace of mind.',
      href: '/about/safety',
      cta: 'Learn More',
    },
    {
      icon: <Users className="h-10 w-10 text-foreground" />,
      title: 'Join Our Community',
      description: 'Connect with fellow car enthusiasts and travelers. Share your experiences and get tips from our growing community.',
      href: '/community',
      cta: 'Get Involved',
    },
  ];

export function PromoSection() {
  return (
    <div className="space-y-16">
      <div className="text-center space-y-6">
        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Why Choose Us?</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Experience the future of car sharing with our platform built for trust, convenience, and community</p>
      </div>
      
      <div className="grid gap-8 md:gap-10 lg:gap-12 md:grid-cols-3">
        {features.map((feature) => (
            <Card key={feature.title} className="group border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
                <CardContent className="flex flex-col items-center p-10 text-center space-y-6 h-full">
                    <div className="flex-shrink-0 bg-muted p-6 group-hover:bg-muted/80 transition-colors duration-300">
                        {feature.icon}
                    </div>
                    <div className="flex-1 space-y-4">
                        <h3 className="text-2xl font-bold text-foreground">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                    <Button 
                        variant="outline" 
                        asChild
                        className="border-border text-foreground hover:bg-muted px-8 py-3 font-semibold shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto"
                    >
                        <Link href={feature.href}>{feature.cta}</Link>
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
} 