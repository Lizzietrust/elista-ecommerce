"use client";

import { useCategoriesForDisplay } from "@/lib/hooks/use-categories";
import { Loader2 } from "lucide-react";
import CategoryCard from "@/components/ui/category-card";

export default function CategoryGrid() {
  const { categories, isLoading, error } = useCategoriesForDisplay();

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Shop by Category
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isLoading
              ? "Loading our collections..."
              : error
                ? "Unable to load categories at the moment."
                : categories.length === 0
                  ? "No categories available yet."
                  : "Find what you love in our curated collections"}
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        )}

        {!isLoading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category._id}
                id={category._id}
                name={category.name}
                count={category.count}
                icon={category.icon}
                image={category.image}
                gradient={category.gradient}
                description={category.description}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
