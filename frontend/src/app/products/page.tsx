import ProductGrid from "@/components/products/product-grid";
import ProductFilters from "@/components/products/product-filters";
import ProductSort from "@/components/products/product-sort";
import Pagination from "@/components/ui/pagination";
import { getProducts } from "@/lib/data/products";

interface ProductsPageProps {
  searchParams: {
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    q?: string;
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = 12;

  const { products, totalCount, categories, brands } = await getProducts({
    category: searchParams.category,
    sort: searchParams.sort || "newest",
    minPrice: searchParams.minPrice
      ? parseInt(searchParams.minPrice)
      : undefined,
    maxPrice: searchParams.maxPrice
      ? parseInt(searchParams.maxPrice)
      : undefined,
    searchQuery: searchParams.q, 
    page,
    pageSize, 
  });
    
  console.log({ products });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Our Products
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover our collection of {totalCount} amazing products
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="lg:w-1/4">
          <ProductFilters
            categories={categories}
            brands={brands}
            selectedCategory={searchParams.category}
            selectedMinPrice={searchParams.minPrice}
            selectedMaxPrice={searchParams.maxPrice}
          />
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {/* Header with sort and results count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(page - 1) * pageSize + 1} -{" "}
              {Math.min(page * pageSize, totalCount)} of {totalCount} products
            </div>
            <ProductSort currentSort={searchParams.sort} />
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <>
              <ProductGrid products={products} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    baseUrl="/products"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or search criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
