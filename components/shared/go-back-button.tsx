'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function GoBackButton() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Button 
      variant="ghost" 
      size="lg"
      onClick={handleGoBack}
      className="font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center space-x-2"
    >
      <ArrowLeft className="h-5 w-5" />
      <span>Go Back</span>
    </Button>
  );
} 