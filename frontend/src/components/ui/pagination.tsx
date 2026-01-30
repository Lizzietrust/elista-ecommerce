// components/ui/pagination.tsx
"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <Link
          key={i}
          href={getPageUrl(i)}
          className={`flex items-center justify-center h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
            currentPage === i
              ? "bg-primary text-primary-foreground"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {i}
        </Link>,
      );
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1}
        asChild={currentPage !== 1}
      >
        {currentPage === 1 ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <Link href={getPageUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        )}
      </Button>

      {renderPageNumbers()}

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages}
        asChild={currentPage !== totalPages}
      >
        {currentPage === totalPages ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <Link href={getPageUrl(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </Button>
    </div>
  );
}
