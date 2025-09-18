// src/components/ui/progress.jsx
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-gradient-ag transition-all duration-300 ease-in-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

// Agricultural progress variants
const CropProgress = React.forwardRef(({ className, value, stage, ...props }, ref) => {
  const stageColors = {
    planting: "bg-gradient-to-r from-yellow-400 to-yellow-500",
    growing: "bg-gradient-to-r from-green-400 to-green-500",
    flowering: "bg-gradient-to-r from-pink-400 to-pink-500",
    harvesting: "bg-gradient-to-r from-orange-400 to-orange-500",
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-in-out",
          stageColors[stage] || "bg-gradient-ag"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
CropProgress.displayName = "CropProgress";

export { Progress, CropProgress };
