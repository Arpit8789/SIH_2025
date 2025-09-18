// src/components/common/LoadingSpinner.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const LoadingSpinner = ({ 
  size = 'default', 
  text, 
  className,
  variant = 'default',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const variantClasses = {
    default: 'text-primary',
    secondary: 'text-muted-foreground',
    white: 'text-white'
  };

  const spinner = (
    <div className={cn("flex items-center gap-2", className)}>
      <Loader2 
        className={cn(
          "animate-spin", 
          sizeClasses[size],
          variantClasses[variant]
        )} 
      />
      {text && (
        <span className={cn(
          "text-sm",
          variantClasses[variant]
        )}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4 p-8 bg-background rounded-lg border shadow-lg">
          <div className="w-8 h-8 bg-gradient-ag rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🌾</span>
          </div>
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

// Specialized loading components for different contexts
export const CropLoadingSpinner = ({ text = "Loading crops..." }) => (
  <div className="flex items-center gap-2 text-primary">
    <div className="animate-bounce">🌾</div>
    <LoadingSpinner text={text} />
  </div>
);

export const WeatherLoadingSpinner = ({ text = "Getting weather..." }) => (
  <div className="flex items-center gap-2 text-sky-600">
    <div className="animate-pulse">🌤️</div>
    <LoadingSpinner text={text} />
  </div>
);

export const PriceLoadingSpinner = ({ text = "Loading prices..." }) => (
  <div className="flex items-center gap-2 text-emerald-600">
    <div className="animate-bounce">💰</div>
    <LoadingSpinner text={text} />
  </div>
);

export default LoadingSpinner;
