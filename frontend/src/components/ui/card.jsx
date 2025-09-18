// src/components/ui/card.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

// Card components with agricultural styling
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      "transition-all duration-200",
      // Agricultural theme enhancements
      "hover:shadow-md hover:shadow-primary/5",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Specialized card variants for agriculture
const CropCard = React.forwardRef(({ className, onClick, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "cursor-pointer hover:border-primary/50 group",
      "transition-all duration-300 hover:-translate-y-1",
      onClick && "hover:shadow-lg hover:shadow-primary/10",
      className
    )}
    onClick={onClick}
    {...props}
  />
));
CropCard.displayName = "CropCard";

const PriceCard = React.forwardRef(({ className, trend, ...props }, ref) => {
  const trendColors = {
    rising: "border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20",
    falling: "border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20",
    stable: "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
  };

  return (
    <Card
      ref={ref}
      className={cn(
        trendColors[trend] || trendColors.stable,
        className
      )}
      {...props}
    />
  );
});
PriceCard.displayName = "PriceCard";

const WeatherCard = React.forwardRef(({ className, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20",
      "border-sky-200 dark:border-sky-800",
      className
    )}
    {...props}
  />
));
WeatherCard.displayName = "WeatherCard";

const StatCard = React.forwardRef(({ className, variant, ...props }, ref) => {
  const variants = {
    success: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800",
    warning: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800",
    info: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800",
    default: "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 border-gray-200 dark:border-gray-800",
  };

  return (
    <Card
      ref={ref}
      className={cn(
        variants[variant] || variants.default,
        "p-6",
        className
      )}
      {...props}
    />
  );
});
StatCard.displayName = "StatCard";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  // Agricultural variants
  CropCard,
  PriceCard,
  WeatherCard,
  StatCard,
};
