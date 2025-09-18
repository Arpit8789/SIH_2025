// src/components/ui/skeleton.jsx
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  );
}

// Agricultural skeleton variants
function CropCardSkeleton({ className }) {
  return (
    <div className={cn("p-4 border rounded-lg", className)}>
      <Skeleton className="h-32 w-full mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

function WeatherCardSkeleton({ className }) {
  return (
    <div className={cn("p-4 border rounded-lg", className)}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

function PriceCardSkeleton({ className }) {
  return (
    <div className={cn("p-4 border rounded-lg border-l-4", className)}>
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-6 w-24 mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export { 
  Skeleton, 
  CropCardSkeleton, 
  WeatherCardSkeleton, 
  PriceCardSkeleton 
};
