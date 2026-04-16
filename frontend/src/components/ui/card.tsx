import * as React from "react";
import { cn } from "@/lib/utils/cn";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hover?: boolean;
    variant?: "default" | "elevated" | "outline" | "ghost";
  }
>(({ className, hover = true, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "bg-card text-card-foreground border border-border",
    elevated: "bg-card text-card-foreground border border-border shadow-lg",
    outline: "bg-transparent border-2 border-border text-card-foreground",
    ghost: "bg-transparent border-none shadow-none",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl overflow-hidden transition-all duration-300",
        variantClasses[variant],
        hover && "hover:shadow-xl hover:-translate-y-1",
        className,
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: "default" | "sm" | "lg" | "none";
  }
>(({ className, spacing = "default", ...props }, ref) => {
  const spacingClasses = {
    default: "p-6",
    sm: "p-4",
    lg: "p-8",
    none: "p-0",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5",
        spacingClasses[spacing],
        className,
      )}
      {...props}
    />
  );
});
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  }
>(({ className, as: Component = "h3", ...props }, ref) => {
  const sizeClasses = {
    h1: "text-4xl md:text-5xl",
    h2: "text-3xl md:text-4xl",
    h3: "text-2xl md:text-3xl",
    h4: "text-xl md:text-2xl",
    h5: "text-lg md:text-xl",
    h6: "text-base md:text-lg",
  };

  return (
    <Component
      ref={ref}
      className={cn(
        "font-bold leading-tight tracking-tight text-foreground",
        sizeClasses[Component],
        className,
      )}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    truncate?: boolean;
    lines?: 1 | 2 | 3;
  }
>(({ className, truncate, lines, ...props }, ref) => {
  const lineClampClasses = {
    1: "line-clamp-1",
    2: "line-clamp-2",
    3: "line-clamp-3",
  };

  return (
    <p
      ref={ref}
      className={cn(
        "text-sm text-muted-foreground",
        truncate && "truncate",
        lines && lineClampClasses[lines],
        className,
      )}
      {...props}
    />
  );
});
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: "default" | "sm" | "lg" | "none";
  }
>(({ className, spacing = "default", ...props }, ref) => {
  const spacingClasses = {
    default: "p-6",
    sm: "p-4",
    lg: "p-8",
    none: "p-0",
  };

  return (
    <div
      ref={ref}
      className={cn(spacingClasses[spacing], "pt-0", className)}
      {...props}
    />
  );
});
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: "default" | "sm" | "lg" | "none";
    divider?: boolean;
  }
>(({ className, spacing = "default", divider = false, ...props }, ref) => {
  const spacingClasses = {
    default: "p-6",
    sm: "p-4",
    lg: "p-8",
    none: "p-0",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        spacingClasses[spacing],
        divider && "border-t border-border pt-6",
        className,
      )}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter";

// Additional Card Components
const CardImage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    src?: string;
    alt?: string;
    height?: string;
  }
>(({ className, src, alt, height = "h-48", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative overflow-hidden bg-muted", height, className)}
    {...props}
  >
    {src ? (
      <img
        src={src}
        alt={alt || "Card image"}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    ) : (
      children
    )}
  </div>
));
CardImage.displayName = "CardImage";

const CardBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "success" | "warning" | "destructive" | "accent";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    accent: "bg-accent text-accent-foreground",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold shadow-sm",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
});
CardBadge.displayName = "CardBadge";

const CardActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2", className)}
    {...props}
  />
));
CardActions.displayName = "CardActions";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardImage,
  CardBadge,
  CardActions,
};
