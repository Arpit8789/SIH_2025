// src/components/ui/badge.jsx
import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        info:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        // Agricultural specific badges
        crop:
          "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        season:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        price:
          "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
        weather:
          "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
        trend: {
          rising: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          falling: "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          stable: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        },
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

// Specialized agricultural badges
const TrendBadge = React.forwardRef(({ trend, className, ...props }, ref) => {
  const trendIcons = {
    rising: "📈",
    falling: "📉",
    stable: "➖",
  };

  const trendColors = {
    rising: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    falling: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    stable: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  };

  return (
    <Badge
      ref={ref}
      className={cn(trendColors[trend] || trendColors.stable, className)}
      {...props}
    >
      <span className="mr-1">{trendIcons[trend]}</span>
      {trend || "stable"}
    </Badge>
  );
});
TrendBadge.displayName = "TrendBadge";

const StatusBadge = React.forwardRef(({ status, className, ...props }, ref) => {
  const statusVariants = {
    active: "success",
    inactive: "secondary",
    pending: "warning",
    completed: "success",
    cancelled: "destructive",
    verified: "success",
    unverified: "warning",
  };

  return (
    <Badge
      ref={ref}
      variant={statusVariants[status] || "default"}
      className={className}
      {...props}
    >
      {status || "unknown"}
    </Badge>
  );
});
StatusBadge.displayName = "StatusBadge";

export { Badge, TrendBadge, StatusBadge, badgeVariants };
