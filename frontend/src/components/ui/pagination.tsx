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
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  showFirstLast = true,
  className = "",
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

  const renderPageNumbers = () => {
    const pages = getPageNumbers();

    return pages.map((page, index) => {
      if (page === "...") {
        return (
          <span
            key={`ellipsis-${index}`}
            className="flex items-center justify-center h-10 w-10 text-gray-500"
            aria-hidden="true"
          >
            ...
          </span>
        );
      }

      const pageNum = page as number;
      const isActive = currentPage === pageNum;

      return (
        <button
          key={pageNum}
          onClick={() => updatePage(pageNum)}
          className={`flex items-center justify-center h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? "bg-primary text-primary-foreground pointer-events-none"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          aria-label={`Go to page ${pageNum}`}
          aria-current={isActive ? "page" : undefined}
        >
          {pageNum}
        </button>
      );
    });
  };

  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center gap-1">
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => updatePage(1)}
            disabled={currentPage === 1}
            aria-label="Go to first page"
            className="h-10 w-10"
          >
            <ChevronFirst className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => updatePage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          className="h-10 w-10"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {renderPageNumbers()}
        </div>

        {/* Mobile version - only show current page */}
        <div className="flex sm:hidden items-center">
          <span className="px-3 py-2 text-sm font-medium">
            {currentPage} / {totalPages}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => updatePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          className="h-10 w-10"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => updatePage(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Go to last page"
            className="h-10 w-10"
          >
            <ChevronLast className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
