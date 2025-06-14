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
      className={cn('py-36 sm:py-24 lg:py-32', className)}
      {...props}
    >
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {children}
      </div>
    </Comp>
  );
} 