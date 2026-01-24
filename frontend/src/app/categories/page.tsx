import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";

const categories = [
  {
    slug: "electronics",
    name: "Electronics",
    description: "Gadgets, devices, and tech accessories",
    productCount: 156,
    image: "⚡",
    color: "bg-blue-500",
  },
  {
    slug: "fashion",
    name: "Fashion",
    description: "Clothing, shoes, and accessories",
    productCount: 234,
    image: "👗",
    color: "bg-pink-500",
  },
  {
    slug: "home",
    name: "Home & Garden",
    description: "Furniture, decor, and garden supplies",
    productCount: 189,
    image: "🏡",
    color: "bg-green-500",
  },
  {
    slug: "sports",
    name: "Sports",
    description: "Equipment and athletic wear",
    productCount: 98,
    image: "⚽",
    color: "bg-orange-500",
  },
  {
    slug: "beauty",
    name: "Beauty",
    description: "Cosmetics, skincare, and wellness",
    productCount: 167,
    image: "💄",
    color: "bg-purple-500",
  },
  {
    slug: "books",
    name: "Books",
    description: "Fiction, non-fiction, and educational",
    productCount: 342,
    image: "📚",
    color: "bg-amber-500",
  },
  {
    slug: "toys",
    name: "Toys & Games",
    description: "For kids and family entertainment",
    productCount: 123,
    image: "🎮",
    color: "bg-red-500",
  },
  {
    slug: "food",
    name: "Food & Drinks",
    description: "Gourmet items and beverages",
    productCount: 89,
    image: "🍎",
    color: "bg-emerald-500",
  },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Browse Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Discover products organized by category. Find exactly what you're
            looking for.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 h-full">
                {/* Category Image */}
                <div
                  className={`h-48 ${category.color} flex items-center justify-center relative overflow-hidden`}
                >
                  <div className="text-7xl">{category.image}</div>
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Category Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {category.name}
                    </h3>
                    <ChevronRight
                      className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      size={20}
                    />
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category.productCount} products
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Explore →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Popular This Month
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/categories/electronics">
              <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl p-8 md:p-12 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="text-8xl">💻</div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">
                      Electronics Sale
                    </h3>
                    <p className="text-blue-100 mb-4">
                      Up to 50% off on latest gadgets
                    </p>
                    <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-medium">
                      Shop Now →
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/categories/fashion">
              <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl p-8 md:p-12 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="text-8xl">👕</div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">New Arrivals</h3>
                    <p className="text-pink-100 mb-4">
                      Fresh styles for every season
                    </p>
                    <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-medium">
                      Discover →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
