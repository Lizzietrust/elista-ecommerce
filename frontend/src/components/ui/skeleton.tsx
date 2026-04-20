// components/ui/skeleton.tsx
import { cn } from "@/lib/utils/cn";
import { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circle" | "rounded" | "card" | "text";
  animate?: boolean;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "default",
  animate = true,
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    default: "rounded-md",
    circle: "rounded-full",
    rounded: "rounded-xl",
    card: "rounded-2xl",
    text: "rounded-md",
  };

  const customStyle = {
    ...(width && { width: typeof width === "number" ? `${width}px` : width }),
    ...(height && {
      height: typeof height === "number" ? `${height}px` : height,
    }),
    ...style,
  };

  return (
    <div
      className={cn(
        "bg-muted/70",
        animate && "animate-pulse",
        variantClasses[variant],
        className,
      )}
      style={customStyle}
      {...props}
    />
  );
}

// Convenience components that accept className and other props
interface SkeletonWrapperProps extends HTMLAttributes<HTMLDivElement> {}

export function ProductCardSkeleton({
  className,
  ...props
}: SkeletonWrapperProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl overflow-hidden border border-border",
        className,
      )}
      {...props}
    >
      <Skeleton variant="card" className="h-48 w-full" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <Skeleton variant="rounded" className="h-6 w-20" />
          <Skeleton variant="rounded" className="h-5 w-16" />
        </div>
        <Skeleton variant="text" className="h-6 w-3/4" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="circle" className="h-4 w-4" />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="h-8 w-24" />
          <Skeleton variant="rounded" className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton({ className, ...props }: SkeletonWrapperProps) {
  return (
    <section
      className={cn(
        "relative bg-gradient-forest text-white py-16 md:py-24 overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-2xl space-y-4">
          <Skeleton variant="rounded" className="h-12 w-3/4 bg-white/20" />
          <Skeleton variant="rounded" className="h-6 w-full bg-white/20" />
          <Skeleton variant="rounded" className="h-6 w-2/3 bg-white/20" />
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Skeleton variant="rounded" className="h-12 w-32 bg-white/20" />
            <Skeleton variant="rounded" className="h-12 w-40 bg-white/20" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CategoryGridSkeleton({
  className,
  ...props
}: SkeletonWrapperProps) {
  return (
    <section
      className={cn("py-12 md:py-16 bg-background", className)}
      {...props}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <Skeleton variant="rounded" className="h-10 w-64 mx-auto mb-3" />
          <Skeleton variant="rounded" className="h-5 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl overflow-hidden border border-border"
            >
              <Skeleton variant="card" className="h-48 w-full" />
              <div className="p-6 space-y-2">
                <Skeleton variant="text" className="h-6 w-32 mx-auto" />
                <Skeleton variant="text" className="h-4 w-24 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewsletterSkeleton({
  className,
  ...props
}: SkeletonWrapperProps) {
  return (
    <section
      className={cn("py-12 md:py-16 bg-gradient-forest text-white", className)}
      {...props}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Skeleton
            variant="rounded"
            className="h-10 w-64 mx-auto bg-white/20"
          />
          <Skeleton
            variant="rounded"
            className="h-6 w-96 mx-auto bg-white/20"
          />
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <Skeleton variant="rounded" className="h-14 flex-1 bg-white/20" />
            <Skeleton variant="rounded" className="h-14 w-40 bg-white/20" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedProductsSkeleton({
  className,
  ...props
}: SkeletonWrapperProps) {
  return (
    <section className={cn("py-12 md:py-16 bg-muted", className)} {...props}>
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <Skeleton variant="rounded" className="h-10 w-64 mx-auto mb-3" />
          <Skeleton variant="rounded" className="h-5 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {[...Array(4)].map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductPageSkeleton({
  className,
  ...props
}: SkeletonWrapperProps) {
  return (
    <div
      className={cn("container mx-auto px-4 md:px-8 py-8", className)}
      {...props}
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Images */}
        <div className="lg:w-1/2 space-y-4">
          <Skeleton variant="card" className="aspect-square w-full" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rounded" className="w-20 h-20" />
            ))}
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="lg:w-1/2 space-y-6">
          <div className="space-y-3">
            <Skeleton variant="rounded" className="h-8 w-24" />
            <Skeleton variant="text" className="h-10 w-3/4" />
            <div className="flex gap-2">
              <Skeleton variant="rounded" className="h-6 w-32" />
              <Skeleton variant="rounded" className="h-6 w-24" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton variant="text" className="h-8 w-32" />
            <Skeleton variant="text" className="h-6 w-48" />
          </div>

          <div className="space-y-4">
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-3/4" />
          </div>

          <div className="flex gap-4">
            <Skeleton variant="rounded" className="h-12 w-32" />
            <Skeleton variant="rounded" className="h-12 w-48" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartSkeleton({ className, ...props }: SkeletonWrapperProps) {
  return (
    <div
      className={cn("container mx-auto px-4 md:px-8 py-8", className)}
      {...props}
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3 space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 border border-border"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <Skeleton variant="rounded" className="h-24 w-24" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="h-6 w-48" />
                  <Skeleton variant="text" className="h-4 w-32" />
                  <Skeleton variant="text" className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton variant="rounded" className="h-10 w-32" />
                  <Skeleton variant="rounded" className="h-10 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-card rounded-2xl p-6 border border-border sticky top-24 space-y-4">
            <Skeleton variant="text" className="h-8 w-40" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton variant="text" className="h-5 w-24" />
                <Skeleton variant="text" className="h-5 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton variant="text" className="h-5 w-24" />
                <Skeleton variant="text" className="h-5 w-16" />
              </div>
              <div className="flex justify-between pt-4 border-t">
                <Skeleton variant="text" className="h-6 w-24" />
                <Skeleton variant="text" className="h-6 w-20" />
              </div>
            </div>
            <Skeleton variant="rounded" className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
