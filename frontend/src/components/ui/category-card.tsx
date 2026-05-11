"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Package } from "lucide-react";

interface CategoryCardProps {
  id: string;
  name: string;
  count: number;
  icon?: string;
  image?: string | { url: string; altText?: string } | null;
  gradient?: string;
  description?: string;
}

export default function CategoryCard({
  id,
  name,
  count,
  icon,
  image,
  gradient = "from-primary/20 to-accent/20",
  description,
}: CategoryCardProps) {
  const imageUrl = typeof image === "string" ? image : image?.url;
  const imageAlt = typeof image === "object" ? image?.altText : name;

  return (
    <Link href={`/products?category=${id}`} className="group block h-full">
      <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1">
        {/* Category Image Section */}
        <div className="relative h-52 overflow-hidden bg-linear-to-br from-muted to-muted/50">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={imageAlt || name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Dark overlay for better contrast */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
            </>
          ) : (
            <div
              className={`w-full h-full bg-linear-to-br ${gradient} flex items-center justify-center`}
            >
              <span className="text-8xl transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                {icon || "📁"}
              </span>
            </div>
          )}

          {/* Category badge on image */}
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-xs font-medium text-white">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        {/* Category Info Section */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
              {name}
            </h3>
            <div className="bg-accent/10 rounded-full p-1.5 group-hover:bg-accent/20 transition-colors shrink-0 ml-2">
              <ChevronRight
                className="text-accent transition-colors"
                size={16}
              />
            </div>
          </div>

          {description && (
            <p className="text-muted-foreground mb-4 line-clamp-2 text-sm flex-1">
              {description}
            </p>
          )}

          {/* Stats Section */}
          <div className="flex items-center justify-between pt-3 mt-auto border-t border-border">
            <div className="flex items-center gap-2">
              <div className="bg-accent/10 rounded-full p-1.5">
                <Package size={14} className="text-accent" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">
                  {count.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  products
                </span>
              </div>
            </div>
            <span className="text-sm font-medium text-accent group-hover:text-accent/80 transition-colors">
              Shop Now →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
