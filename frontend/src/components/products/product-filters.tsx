"use client";

import { useRouter } from "next/navigation";
import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface ProductFiltersProps {
  categories: string[];
  brands: string[];
  selectedCategory?: string;
  selectedMinPrice?: string;
  selectedMaxPrice?: string;
}

export default function ProductFilters({
  categories,
  brands,
  selectedCategory,
  selectedMinPrice,
  selectedMaxPrice,
}: ProductFiltersProps) {
  const router = useRouter();

  const handleFilterChange = (key: string, value: string | number) => {
    const params = new URLSearchParams(window.location.search);

    if (value) {
      params.set(key, value.toString());
    } else {
      params.delete(key);
    }

    params.delete("page"); // Reset to page 1 when filters change
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/products");
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </h3>
        {(selectedCategory || selectedMinPrice || selectedMaxPrice) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-sm"
          >
            Clear all
            <X className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <h4 className="font-medium mb-4 text-gray-900 dark:text-white">
          Price Range
        </h4>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={selectedMinPrice || ""}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              className="h-9"
            />
            <Input
              type="number"
              placeholder="Max"
              value={selectedMaxPrice || ""}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              className="h-9"
            />
          </div>
          <Slider
            defaultValue={[0, 1000]}
            value={[
              parseInt(selectedMinPrice || "0"),
              parseInt(selectedMaxPrice || "1000"),
            ]}
            min={0}
            max={1000}
            step={10}
            onValueChange={(value) => {
              handleFilterChange("minPrice", value[0]);
              handleFilterChange("maxPrice", value[1]);
            }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h4 className="font-medium mb-4 text-gray-900 dark:text-white">
          Categories
        </h4>
        <div className="space-y-2">
          <button
            onClick={() => handleFilterChange("category", "")}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !selectedCategory
                ? "bg-primary text-primary-foreground font-medium"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleFilterChange("category", category)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="mb-8">
          <h4 className="font-medium mb-4 text-gray-900 dark:text-white">
            Brands
          </h4>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  onChange={(e) => handleFilterChange("brand", brand)}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
