"use client";

import Link from "next/link";
import Image from "next/image";
import { useCategoriesForDisplay } from "@/lib/hooks/use-categories";
import { Loader2 } from "lucide-react";

export default function CategoryGrid() {
  const { categories, isLoading, error } = useCategoriesForDisplay();

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Loading our collections...
            </p>
          </div>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Unable to load categories at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No categories available yet.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Shop by Category
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find what you love in our curated collections
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/products?category=${category._id}`}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div
                className={`h-48 bg-linear-to-br ${category.gradient} flex flex-col items-center justify-center text-white relative`}
              >
                {category.image && (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover opacity-50 group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                <div className="relative z-10 text-center">
                  <span className="text-5xl mb-4 block transform group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </span>
                  <h3 className="text-2xl font-bold">{category.name}</h3>
                </div>
              </div>

              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center text-white p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-xl font-semibold">
                    Explore {category.count} items
                  </p>
                  <p className="mt-2 text-lg font-medium">
                    Shop Now{" "}
                    <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </p>
                </div>
              </div>

              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-foreground font-bold py-1 px-3 rounded-full text-sm shadow-sm z-10">
                {category.count}+
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
