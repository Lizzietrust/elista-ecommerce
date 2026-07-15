"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
  selectedBrand?: string;
  onCategoryChange?: (category: string) => void;
  onBrandChange?: (brand: string) => void;
}

export default function ProductFilters({
  categories,
  brands,
  selectedCategory,
  selectedMinPrice,
  selectedMaxPrice,
  selectedBrand,
  onCategoryChange,
  onBrandChange,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value.toString().trim() !== "") {
      params.set(key, value.toString());
    } else {
      params.delete(key);
    }

    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/products");
  };

  const minPriceValue = parseInt(selectedMinPrice || "0");
  const maxPriceValue = parseInt(selectedMaxPrice || "1000");

  const sliderValue = [
    isNaN(minPriceValue) ? 0 : Math.max(0, minPriceValue),
    isNaN(maxPriceValue) ? 1000 : Math.min(1000, maxPriceValue),
  ];

  const handleCategoryClick = (category: string) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      if (category && category.trim() !== "") {
        params.set("category", category);
      } else {
        params.delete("category");
      }
      params.delete("page");
      router.push(`/products?${params.toString()}`);
    }
  };

  const handleBrandClick = (brand: string) => {
    if (onBrandChange) {
      onBrandChange(brand);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      if (brand && brand.trim() !== "") {
        params.set("brand", brand);
      } else {
        params.delete("brand");
      }
      params.delete("page");
      router.push(`/products?${params.toString()}`);
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
          <Filter className="h-5 w-5 text-accent" />
          Filters
        </h3>
        {(selectedCategory ||
          selectedMinPrice ||
          selectedMaxPrice ||
          selectedBrand) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-sm text-muted-foreground hover:text-accent hover:bg-muted transition-all duration-200"
          >
            Clear all
            <X className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <h4 className="font-medium mb-4 text-foreground">Price Range</h4>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              min={0}
              max={1000}
              value={selectedMinPrice || ""}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              className="h-9 border-border focus:ring-ring focus:ring-2"
            />
            <Input
              type="number"
              placeholder="Max"
              min={0}
              max={1000}
              value={selectedMaxPrice || ""}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              className="h-9 border-border focus:ring-ring focus:ring-2"
            />
          </div>
          <div className="px-2">
            <Slider
              defaultValue={[0, 1000]}
              value={sliderValue}
              min={0}
              max={1000}
              step={10}
              onValueChange={(value: number[]) => {
                handleFilterChange("minPrice", value[0]);
                handleFilterChange("maxPrice", value[1]);
              }}
              className="**:[[role=slider]]:bg-primary **:[[role=slider]]:border-primary **:[[role=slider]]:hover:bg-primary-light **:[[role=slider]]:focus:ring-ring"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>$0</span>
            <span>$1000</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h4 className="font-medium mb-4 text-foreground">Categories</h4>
        <div className="space-y-2">
          <button
            onClick={() => handleCategoryClick("")}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              !selectedCategory
                ? "bg-primary text-primary-foreground font-medium shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
          <h4 className="font-medium mb-4 text-foreground">Brands</h4>
          <div className="space-y-2">
            <button
              onClick={() => handleBrandClick("")}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                !selectedBrand
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              All Brands
            </button>
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => handleBrandClick(brand)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  selectedBrand === brand
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {(selectedCategory ||
        selectedMinPrice ||
        selectedMaxPrice ||
        selectedBrand) && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="font-medium mb-3 text-foreground text-sm">
            Active Filters
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <div className="flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                <span>Category: {selectedCategory}</span>
                <button
                  onClick={() => handleCategoryClick("")}
                  className="ml-2 hover:text-accent-dark"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {selectedBrand && (
              <div className="flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                <span>Brand: {selectedBrand}</span>
                <button
                  onClick={() => handleBrandClick("")}
                  className="ml-2 hover:text-accent-dark"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {(selectedMinPrice || selectedMaxPrice) && (
              <div className="flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                <span>
                  Price: ${selectedMinPrice || "0"} - $
                  {selectedMaxPrice || "1000"}
                </span>
                <button
                  onClick={() => {
                    handleFilterChange("minPrice", "");
                    handleFilterChange("maxPrice", "");
                  }}
                  className="ml-2 hover:text-accent-dark"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
