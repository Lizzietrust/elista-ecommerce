import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";

const categories = [
  {
    slug: "electronics",
    name: "Electronics",
    description: "Gadgets, devices, and tech accessories",
    productCount: 156,
    image: "⚡",
    gradient: "from-[#2C3E3E] to-[#4A6B6B]",
  },
  {
    slug: "fashion",
    name: "Fashion",
    description: "Clothing, shoes, and accessories",
    productCount: 234,
    image: "👗",
    gradient: "from-[#C17B4D] to-[#D49A6A]",
  },
  {
    slug: "home",
    name: "Home & Garden",
    description: "Furniture, decor, and garden supplies",
    productCount: 189,
    image: "🏡",
    gradient: "from-[#6B8E6B] to-[#8BAA8B]",
  },
  {
    slug: "sports",
    name: "Sports",
    description: "Equipment and athletic wear",
    productCount: 98,
    image: "⚽",
    gradient: "from-[#D4C4B7] to-[#E8DED5]",
  },
  {
    slug: "beauty",
    name: "Beauty",
    description: "Cosmetics, skincare, and wellness",
    productCount: 167,
    image: "💄",
    gradient: "from-[#C17B7B] to-[#D49A9A]",
  },
  {
    slug: "books",
    name: "Books",
    description: "Fiction, non-fiction, and educational",
    productCount: 342,
    image: "📚",
    gradient: "from-[#8B6B4D] to-[#A88B6D]",
  },
  {
    slug: "toys",
    name: "Toys & Games",
    description: "For kids and family entertainment",
    productCount: 123,
    image: "🎮",
    gradient: "from-[#2C3E3E] to-[#4A6B6B]",
  },
  {
    slug: "food",
    name: "Food & Drinks",
    description: "Gourmet items and beverages",
    productCount: 89,
    image: "🍎",
    gradient: "from-[#C17B4D] to-[#D49A6A]",
  },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen py-8 md:py-12 bg-[#FDF8F5] dark:bg-[#2C2C2C]">
      <div className="container mx-auto px-4 md:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] dark:text-white mb-4">
            Browse Categories
          </h1>
          <p className="text-[#6B6B6B] dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Discover products organized by category. Find exactly what you're
            looking for.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]"
              size={20}
            />
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#E8E0D8] bg-white dark:bg-gray-900 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
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
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 h-full border border-[#E8E0D8] dark:border-gray-700">
                {/* Category Image */}
                <div
                  className={`h-48 bg-linear-to-br ${category.gradient} flex items-center justify-center relative overflow-hidden`}
                >
                  <div className="text-7xl transform group-hover:scale-110 transition-transform duration-300">
                    {category.image}
                  </div>
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Category Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-[#2C2C2C] dark:text-white group-hover:text-[#C17B4D] transition-colors">
                      {category.name}
                    </h3>
                    <ChevronRight
                      className="text-[#6B6B6B] group-hover:text-[#C17B4D] transition-colors"
                      size={20}
                    />
                  </div>

                  <p className="text-[#6B6B6B] dark:text-gray-400 mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#2C2C2C] dark:text-gray-300">
                      {category.productCount} products
                    </span>
                    <span className="text-sm text-[#C17B4D] font-medium group-hover:text-[#D49A6A] transition-colors">
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
          <h2 className="text-2xl font-bold text-[#2C2C2C] dark:text-white mb-8 text-center">
            Popular This Month
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/categories/electronics">
              <div className="bg-linear-to-r from-[#2C3E3E] to-[#4A6B6B] text-white rounded-2xl p-8 md:p-12 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="text-8xl">💻</div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">
                      Electronics Sale
                    </h3>
                    <p className="text-[#D4C4B7] mb-4">
                      Up to 50% off on latest gadgets
                    </p>
                    <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-medium hover:bg-white/30 transition-colors">
                      Shop Now →
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/categories/fashion">
              <div className="bg-linear-to-r from-[#C17B4D] to-[#D49A6A] text-white rounded-2xl p-8 md:p-12 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="text-8xl">👕</div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">New Arrivals</h3>
                    <p className="text-[#F4EFEA] mb-4">
                      Fresh styles for every season
                    </p>
                    <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-medium hover:bg-white/30 transition-colors">
                      Discover →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Additional Categories Section */}
        <div className="mt-16 pt-8 border-t border-[#E8E0D8] dark:border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-sm font-medium text-[#2C2C2C] dark:text-white">
                Fast Shipping
              </p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-sm font-medium text-[#2C2C2C] dark:text-white">
                Secure Payments
              </p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">🔄</div>
              <p className="text-sm font-medium text-[#2C2C2C] dark:text-white">
                Easy Returns
              </p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">🎁</div>
              <p className="text-sm font-medium text-[#2C2C2C] dark:text-white">
                Best Offers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
