// frontend/components/RideButton.tsx
'use client';

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button'; // Assuming ShadCN Button
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface RideButtonProps extends ButtonProps {
  actionType?: 'offer' | 'find' | 'update' | 'book' | 'generic';
  isLoading?: boolean;
  icon?: React.ElementType; // Allow passing an icon component
  fullWidth?: boolean;
}

const RideButton = ({
  children,
  className,
  actionType = 'generic',
  isLoading = false,
  icon: Icon,
  fullWidth = false,
  ...props
}: RideButtonProps) => {
  let variantClass = '';
  switch (actionType) {
    case 'offer':
      variantClass = 'bg-green-600 hover:bg-green-700 text-white';
      break;
    case 'find':
      variantClass = 'bg-blue-600 hover:bg-blue-700 text-white';
      break;
    case 'update':
      variantClass = 'bg-orange-500 hover:bg-orange-600 text-white';
      break;
    case 'book':
      variantClass = 'bg-teal-500 hover:bg-teal-600 text-white';
      break;
    default:
      variantClass = 'bg-primary hover:bg-primary/90 text-primary-foreground'; // Default ShadCN primary
  }

  return (
    <Button
      className={cn(
        "flex items-center justify-center gap-2 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md",
        variantClass,
        fullWidth ? "w-full" : "w-auto",
        isLoading ? "opacity-75 cursor-not-allowed" : "",
        className // Allow overriding classes
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
      {!isLoading && Icon && <Icon className="h-5 w-5" />}
      {children}
    </Button>
  );
};

export default RideButton;