"use client";

import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils/cn";

interface LogoutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "ghost"
    | "link"
    | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  redirectTo?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function LogoutButton({
  variant = "ghost",
  size = "default",
  className = "",
  redirectTo = "/",
  showIcon = true,
  children,
}: LogoutButtonProps) {
  const { logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await logout();
      toast.success("Logged out successfully", {
        duration: 3000,
        position: "top-center",
      });
      router.push(redirectTo);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.", {
        duration: 4000,
        position: "top-center",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={cn(
        "transition-all duration-200",
        variant === "destructive" && "hover:bg-destructive/90",
        className,
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className={cn("h-4 w-4 animate-spin", showIcon && "mr-2")} />
          Logging out...
        </>
      ) : (
        <>
          {showIcon && <LogOut className="h-4 w-4 mr-2" />}
          {children || "Logout"}
        </>
      )}
    </Button>
  );
}

export default LogoutButton;
