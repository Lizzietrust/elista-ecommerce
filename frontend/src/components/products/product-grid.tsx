import { ProductCard } from "./product-card";
import { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    xl?: number;
  };
  className?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function ProductGrid({
  products,
  loading = false,
  columns = { mobile: 1, tablet: 2, desktop: 3, xl: 4 },
  className = "",
  emptyMessage = "No products found",
  emptyDescription = "Try adjusting your search or filter criteria to find what you're looking for.",
  onLoadMore,
  hasMore = false,
}: ProductGridProps) {
  // Dynamic grid columns based on props
  const getGridClasses = () => {
    const gridClasses = [];

    if (columns.mobile) {
      gridClasses.push(`grid-cols-${columns.mobile}`);
    }
    if (columns.tablet) {
      gridClasses.push(`sm:grid-cols-${columns.tablet}`);
    }
    if (columns.desktop) {
      gridClasses.push(`lg:grid-cols-${columns.desktop}`);
    }
    if (columns.xl) {
      gridClasses.push(`xl:grid-cols-${columns.xl}`);
    }

    return gridClasses.join(" ");
  };

  // Loading skeleton
  if (loading && products.length === 0) {
    return (
      <div className={`grid ${getGridClasses()} gap-6 ${className}`}>
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-muted rounded-xl aspect-square mb-4"></div>
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {emptyMessage}
        </h3>
        <p className="text-muted-foreground max-w-md">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Product Count */}
      <div className="text-sm text-muted-foreground">
        Showing {products.length} product{products.length !== 1 ? "s" : ""}
      </div>

      {/* Products Grid */}
      <div className={`grid ${getGridClasses()} gap-6 ${className}`}>
        {products.map((product, index) => (
          <div
            key={product.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-3 bg-primary hover:bg-primary-light text-primary-foreground rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </span>
            ) : (
              "Load More Products"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
