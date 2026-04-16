"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
} from "lucide-react";
import { Button } from "./button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
  showFirstLast?: boolean;
  className?: string;
  variant?: "default" | "minimal" | "rounded";
  size?: "sm" | "default" | "lg";
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  showFirstLast = true,
  className = "",
  variant = "default",
  size = "default",
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());

    // Remove page param if it's page 1
    if (page === 1) {
      params.delete("page");
    }

    const targetUrl = baseUrl
      ? `${baseUrl}${params.toString() ? `?${params.toString()}` : ""}`
      : `${params.toString() ? `?${params.toString()}` : ""}`;

    router.push(targetUrl, { scroll: false }); // Prevent scroll to top
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    const sidePages = Math.floor(maxVisible / 2);

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      // Calculate start and end of middle pages
      let start = Math.max(2, currentPage - sidePages);
      let end = Math.min(totalPages - 1, currentPage + sidePages);

      // Adjust if we're near the beginning
      if (currentPage <= sidePages + 1) {
        end = maxVisible - 1;
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - sidePages) {
        start = totalPages - maxVisible + 2;
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Add last page
      pages.push(totalPages);
    }

    return pages;
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-8 w-8 text-xs";
      case "lg":
        return "h-12 w-12 text-base";
      default:
        return "h-10 w-10 text-sm";
    }
  };

  const getButtonVariant = (isActive: boolean) => {
    if (isActive) {
      return "default";
    }
    if (variant === "minimal") {
      return "ghost";
    }
    return "outline";
  };

  const renderPageNumbers = () => {
    const pages = getPageNumbers();
    const sizeClasses = getSizeClasses();

    return pages.map((page, index) => {
      if (page === "...") {
        return (
          <span
            key={`ellipsis-${index}`}
            className="flex items-center justify-center text-muted-foreground"
            style={{
              height: size === "sm" ? "32px" : size === "lg" ? "48px" : "40px",
              width: size === "sm" ? "32px" : size === "lg" ? "48px" : "40px",
            }}
            aria-hidden="true"
          >
            ...
          </span>
        );
      }

      const pageNum = page as number;
      const isActive = currentPage === pageNum;

      return (
        <Button
          key={pageNum}
          variant={getButtonVariant(isActive)}
          size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
          onClick={() => updatePage(pageNum)}
          className={`${sizeClasses} ${
            isActive
              ? "bg-primary text-primary-foreground hover:bg-primary-light pointer-events-none shadow-sm"
              : "border-border text-foreground hover:bg-muted hover:text-accent"
          } transition-all duration-200`}
          aria-label={`Go to page ${pageNum}`}
          aria-current={isActive ? "page" : undefined}
        >
          {pageNum}
        </Button>
      );
    });
  };

  if (totalPages <= 1) return null;

  const sizeClasses = getSizeClasses();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center gap-1">
        {showFirstLast && (
          <Button
            variant={variant === "minimal" ? "ghost" : "outline"}
            size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
            onClick={() => updatePage(1)}
            disabled={currentPage === 1}
            aria-label="Go to first page"
            className={`${sizeClasses} border-border text-foreground hover:bg-muted hover:text-accent transition-all duration-200`}
          >
            <ChevronFirst className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant={variant === "minimal" ? "ghost" : "outline"}
          size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
          onClick={() => updatePage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          className={`${sizeClasses} border-border text-foreground hover:bg-muted hover:text-accent transition-all duration-200`}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {renderPageNumbers()}
        </div>

        {/* Mobile version - only show current page */}
        <div className="flex sm:hidden items-center">
          <span className="px-3 py-2 text-sm font-medium text-foreground">
            {currentPage} / {totalPages}
          </span>
        </div>

        <Button
          variant={variant === "minimal" ? "ghost" : "outline"}
          size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
          onClick={() => updatePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          className={`${sizeClasses} border-border text-foreground hover:bg-muted hover:text-accent transition-all duration-200`}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {showFirstLast && (
          <Button
            variant={variant === "minimal" ? "ghost" : "outline"}
            size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
            onClick={() => updatePage(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Go to last page"
            className={`${sizeClasses} border-border text-foreground hover:bg-muted hover:text-accent transition-all duration-200`}
          >
            <ChevronLast className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
