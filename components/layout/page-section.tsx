import { cn } from '@/lib/utils';
import React from 'react';

interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

export function PageSection({
  as: Comp = 'section',
  className,
  children,
  ...props
}: PageSectionProps) {
  return (
    <Comp
      className={cn('py-16 sm:py-20 lg:py-24', className)}
      {...props}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </Comp>
  );
} 