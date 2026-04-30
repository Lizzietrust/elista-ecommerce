"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";

interface SortOption {
  value: string;
  label: string;
}

const sortOptions: SortOption[] = [
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
  { value: "-price", label: "Price: High to Low" },
  { value: "price", label: "Price: Low to High" },
  { value: "-averageRating", label: "Highest Rated" },
  { value: "-salesCount", label: "Best Selling" },
  { value: "name", label: "Name: A to Z" },
  { value: "-name", label: "Name: Z to A" },
];

interface ProductSortProps {
  currentSort?: string;
}

export default function ProductSort({
  currentSort = "-createdAt",
}: ProductSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption =
    sortOptions.find((opt) => opt.value === currentSort) || sortOptions[0];

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", sortValue);
    params.set("page", "1"); // Reset to first page when sorting
    router.push(`/products?${params.toString()}`);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent-light transition-all duration-300 shadow-md font-medium"
      >
        <span>Sort by: </span>
        <span className="font-bold">{currentOption.label}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-2xl overflow-hidden animate-slide-down z-50">
            <div className="py-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`w-full px-4 py-2 text-left transition-colors duration-150 flex items-center justify-between group hover:bg-accent/10 ${
                    currentSort === option.value
                      ? "bg-accent/10 text-accent font-semibold"
                      : "text-foreground"
                  }`}
                >
                  <span>{option.label}</span>
                  {currentSort === option.value && (
                    <Check size={16} className="text-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
