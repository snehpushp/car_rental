import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Users, Wallet } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
      icon: <Wallet className="h-8 w-8 text-primary" />,
      title: 'Become a Host',
      description: 'Turn your car into an income source by listing it on our platform. We provide the tools and support to make it easy.',
      href: '/auth/signup?role=owner',
      cta: 'Start Earning',
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: 'Safe & Insured',
      description: 'We verify all users and provide comprehensive insurance coverage for every trip, so you can have peace of mind.',
      href: '/about/safety',
      cta: 'Learn More',
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Join Our Community',
      description: 'Connect with fellow car enthusiasts and travelers. Share your experiences and get tips from our growing community.',
      href: '/community',
      cta: 'Get Involved',
    },
  ];

export function PromoSection() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
        {features.map((feature) => (
            <Card key={feature.title}>
                <CardContent className="flex flex-col items-center p-8 text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-4">
                        {feature.icon}
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                    <p className="mb-6 text-muted-foreground">{feature.description}</p>
                    <Button variant="outline" asChild>
                        <Link href={feature.href}>{feature.cta}</Link>
                    </Button>
                </CardContent>
            </Card>
        ))}
    </div>
  );
} 