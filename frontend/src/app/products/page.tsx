import ProductGrid from "@/components/products/product-grid";
import ProductFilters from "@/components/products/product-filters";
import ProductSort from "@/components/products/product-sort";
import Pagination from "@/components/ui/pagination";
import { getProducts } from "@/lib/data/products";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    q?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const page = parseInt(params.page || "1");
  const pageSize = 12;

  const { products, totalCount, categories, brands } = await getProducts({
    category: params.category,
    sort: params.sort || "newest",
    minPrice: params.minPrice ? parseInt(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
    searchQuery: params.q,
    page,
    pageSize,
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto px-4 py-8 bg-[#FDF8F5] dark:bg-[#2C2C2C] min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#2C2C2C] dark:text-white mb-2">
          Our Products
        </h1>
        <p className="text-[#6B6B6B] dark:text-gray-400">
          Discover our collection of {totalCount} amazing products
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="lg:w-1/4">
          <ProductFilters
            categories={categories}
            brands={brands}
            selectedCategory={params.category}
            selectedMinPrice={params.minPrice}
            selectedMaxPrice={params.maxPrice}
          />
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {/* Header with sort and results count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
              Showing {(page - 1) * pageSize + 1} -{" "}
              {Math.min(page * pageSize, totalCount)} of {totalCount} products
            </div>
            <ProductSort currentSort={params.sort} />
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
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-[#E8E0D8] dark:border-gray-800">
              <div className="h-20 w-20 bg-[#F4EFEA] dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-[#6B6B6B]"
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
              <h3 className="text-xl font-semibold text-[#2C2C2C] dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-[#6B6B6B] dark:text-gray-400">
                Try adjusting your filters or search criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
