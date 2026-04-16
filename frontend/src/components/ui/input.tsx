import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input variant style */
  variant?: "default" | "filled" | "flushed" | "error" | "success";
  /** Left icon to display inside input */
  leftIcon?: React.ReactNode;
  /** Right icon to display inside input */
  rightIcon?: React.ReactNode;
  /** Make input full width */
  fullWidth?: boolean;
  /** Size of the input */
  size?: "sm" | "default" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant = "default",
      leftIcon,
      rightIcon,
      fullWidth = false,
      size = "default",
      disabled,
      ...props
    },
    ref,
  ) => {
    const variantClasses = {
      default: "border-input bg-background focus-visible:ring-ring",
      filled:
        "border-transparent bg-muted focus-visible:bg-background focus-visible:border-input",
      flushed:
        "border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0",
      error: "border-destructive focus-visible:ring-destructive",
      success: "border-success focus-visible:ring-success",
    };

    const sizeClasses = {
      sm: "h-8 px-3 text-xs",
      default: "h-10 px-3 py-2 text-sm",
      lg: "h-12 px-4 py-3 text-base",
    };

    return (
      <div className={cn("relative", fullWidth && "w-full")}>
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          disabled={disabled}
          className={cn(
            "flex w-full rounded-md transition-all duration-200",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            variantClasses[variant],
            sizeClasses[size],
            leftIcon && "pl-9",
            rightIcon && "pr-9",
            variant === "flushed" && "rounded-none",
            className,
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
