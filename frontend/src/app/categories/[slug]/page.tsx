import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Filter,
  Grid,
  List,
  ChevronDown,
  Tag,
  X,
  Sliders,
  Star,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";

// Mock data - replace with your API
const categories = [
  {
    slug: "electronics",
    name: "Electronics",
    description: "Latest gadgets and tech devices",
    products: [
      {
        _id: "1",
        slug: "wireless-headphones",
        name: "Wireless Headphones",
        description:
          "Noise-cancelling over-ear headphones with 30hr battery life",
        price: 129.99,
        comparePrice: 199.99,
        averageRating: 4.5,
        reviewCount: 128,
        images: [{ url: "/images/products/headphones.jpg" }],
        category: "Electronics",
        stock: 15,
        isFeatured: true,
        tags: ["Wireless", "Noise Cancelling"],
        brand: "Sony",
      },
      {
        _id: "2",
        slug: "smart-watch",
        name: "Smart Watch",
        description: "Fitness tracking and smart notifications",
        price: 249.99,
        comparePrice: 299.99,
        averageRating: 4.7,
        reviewCount: 89,
        images: [{ url: "/images/products/watch.jpg" }],
        category: "Electronics",
        stock: 8,
        isFeatured: false,
        tags: ["Fitness", "Smart"],
        brand: "Apple",
      },
      {
        _id: "3",
        slug: "laptop-stand",
        name: "Laptop Stand",
        description: "Adjustable aluminum laptop stand for ergonomic working",
        price: 34.99,
        comparePrice: 49.99,
        averageRating: 4.3,
        reviewCount: 56,
        images: [{ url: "/images/products/laptop-stand.jpg" }],
        category: "Electronics",
        stock: 25,
        isFeatured: true,
        tags: ["Ergonomic", "Adjustable"],
        brand: "Rain Design",
      },
      {
        _id: "4",
        slug: "usb-c-hub",
        name: "USB-C Hub",
        description:
          "7-in-1 USB-C hub with 4K HDMI, USB 3.0, and SD card slots",
        price: 59.99,
        averageRating: 4.6,
        reviewCount: 42,
        images: [{ url: "/images/products/usb-hub.jpg" }],
        category: "Electronics",
        stock: 30,
        isFeatured: false,
        tags: ["7-in-1", "4K"],
        brand: "Anker",
      },
      {
        _id: "5",
        slug: "portable-speaker",
        name: "Portable Speaker",
        description: "Waterproof Bluetooth speaker with 20hr battery",
        price: 89.99,
        comparePrice: 119.99,
        averageRating: 4.4,
        reviewCount: 73,
        images: [{ url: "/images/products/speaker.jpg" }],
        category: "Electronics",
        stock: 12,
        isFeatured: true,
        tags: ["Waterproof", "Bluetooth"],
        brand: "JBL",
      },
      {
        _id: "6",
        slug: "mechanical-keyboard",
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with customizable switches",
        price: 79.99,
        averageRating: 4.8,
        reviewCount: 31,
        images: [{ url: "/images/products/keyboard.jpg" }],
        category: "Electronics",
        stock: 18,
        isFeatured: false,
        tags: ["Mechanical", "RGB"],
        brand: "Logitech",
      },
    ],
    filters: {
      price: { min: 0, max: 1000 },
      brands: ["Apple", "Samsung", "Sony", "Bose", "Logitech", "Anker", "JBL"],
      features: [
        "Wireless",
        "Bluetooth",
        "Noise Cancelling",
        "Waterproof",
        "4K",
        "RGB",
      ],
    },
    stats: {
      averageRating: 4.6,
      totalProducts: 245,
      newArrivals: 12,
    },
  },
  {
    slug: "fashion",
    name: "Fashion",
    description: "Stylish clothing and accessories for every occasion",
    products: [
      {
        _id: "7",
        slug: "cotton-t-shirt",
        name: "Organic Cotton T-Shirt",
        description: "Premium organic cotton t-shirt with slim fit design",
        price: 24.99,
        averageRating: 4.2,
        reviewCount: 94,
        images: [{ url: "/images/products/t-shirt.jpg" }],
        category: "Fashion",
        stock: 50,
        isFeatured: true,
        tags: ["Organic", "Slim Fit"],
        brand: "Patagonia",
      },
      {
        _id: "8",
        slug: "denim-jeans",
        name: "Slim Fit Denim Jeans",
        description: "Classic denim jeans with modern slim fit",
        price: 89.99,
        comparePrice: 119.99,
        averageRating: 4.5,
        reviewCount: 67,
        images: [{ url: "/images/products/jeans.jpg" }],
        category: "Fashion",
        stock: 22,
        isFeatured: false,
        tags: ["Denim", "Slim Fit"],
        brand: "Levi's",
      },
    ],
    filters: {
      price: { min: 0, max: 500 },
      brands: [
        "Nike",
        "Adidas",
        "Levi's",
        "Zara",
        "H&M",
        "Patagonia",
        "Uniqlo",
      ],
      features: ["Organic", "Slim Fit", "Plus Size", "Sustainable", "Vintage"],
    },
    stats: {
      averageRating: 4.4,
      totalProducts: 189,
      newArrivals: 8,
    },
  },
  {
    slug: "home",
    name: "Home & Garden",
    description: "Everything you need to make your house a home",
    products: [
      {
        _id: "9",
        slug: "ceramic-mug",
        name: "Handmade Ceramic Mug",
        description: "Artisan ceramic mug with unique hand-painted design",
        price: 18.99,
        averageRating: 4.7,
        reviewCount: 128,
        images: [{ url: "/images/products/mug.jpg" }],
        category: "Home",
        stock: 100,
        isFeatured: true,
        tags: ["Handmade", "Artisan"],
        brand: "Local Artisan",
      },
    ],
    filters: {
      price: { min: 0, max: 300 },
      brands: [
        "IKEA",
        "West Elm",
        "Crate & Barrel",
        "Pottery Barn",
        "Local Artisan",
      ],
      features: [
        "Eco-friendly",
        "Handmade",
        "Rustic",
        "Modern",
        "Vintage",
        "Sustainable",
      ],
    },
    stats: {
      averageRating: 4.5,
      totalProducts: 156,
      newArrivals: 15,
    },
  },
];

const sortOptions = [
  { value: "featured", label: "Featured", icon: Award },
  { value: "price-low", label: "Price: Low to High", icon: TrendingUp },
  { value: "price-high", label: "Price: High to Low", icon: TrendingUp },
  { value: "rating", label: "Customer Rating", icon: Star },
  { value: "newest", label: "Newest Arrivals", icon: Clock },
];

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((cat) => cat.slug === slug);

  if (!category) {
    return {
      title: "Category Not Found",
      description: "The requested category does not exist.",
    };
  }

  return {
    title: `${category.name} | Elista Ecommerce`,
    description: category.description,
    openGraph: {
      title: `${category.name} | Elista Ecommerce`,
      description: category.description,
      type: "website",
    },
    keywords: [`${category.name} products`, "online shopping", "ecommerce"],
  };
}

// Generate static params for SSG
export async function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const searchParamsObj = searchParams ? await searchParams : {};

  const category = categories.find((cat) => cat.slug === slug);

  if (!category) {
    notFound();
  }

  // Parse search params for filtering/sorting
  const selectedSort =
    typeof searchParamsObj.sort === "string"
      ? searchParamsObj.sort
      : "featured";
  const minPrice = searchParamsObj.min
    ? Number(searchParamsObj.min)
    : category.filters.price.min;
  const maxPrice = searchParamsObj.max
    ? Number(searchParamsObj.max)
    : category.filters.price.max;
  const selectedBrands =
    typeof searchParamsObj.brands === "string"
      ? searchParamsObj.brands.split(",")
      : [];
  const selectedFeatures =
    typeof searchParamsObj.features === "string"
      ? searchParamsObj.features.split(",")
      : [];
  const view =
    typeof searchParamsObj.view === "string" ? searchParamsObj.view : "grid";

  // Filter products based on search params
  let filteredProducts = [...category.products];

  // Apply price filter
  filteredProducts = filteredProducts.filter(
    (product) => product.price >= minPrice && product.price <= maxPrice,
  );

  // Apply brand filter (if any selected)
  if (selectedBrands.length > 0 && selectedBrands[0] !== "") {
    filteredProducts = filteredProducts.filter(
      (product) => product.brand && selectedBrands.includes(product.brand),
    );
  }

  // Apply feature/tag filter
  if (selectedFeatures.length > 0 && selectedFeatures[0] !== "") {
    filteredProducts = filteredProducts.filter((product) =>
      product.tags?.some((tag) => selectedFeatures.includes(tag)),
    );
  }

  // Apply sorting
  filteredProducts.sort((a, b) => {
    switch (selectedSort) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return (b.averageRating || 0) - (a.averageRating || 0);
      case "newest":
        // Assuming newer products have higher IDs (simplified)
        return parseInt(b._id) - parseInt(a._id);
      default: // 'featured'
        // Featured products first, then by rating
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.averageRating || 0) - (a.averageRating || 0);
    }
  });

  // Create URL with updated params
  const createQueryString = (
    params: Record<string, string | number | null>,
  ) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    });

    return searchParams.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Category Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="max-w-4xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-blue-200 mb-6">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronDown size={14} className="rotate-270" />
              <Link
                href="/categories"
                className="hover:text-white transition-colors"
              >
                Categories
              </Link>
              <ChevronDown size={14} className="rotate-270" />
              <span className="font-medium text-white">{category.name}</span>
            </nav>

            {/* Category Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  {category.name}
                </h1>
                <p className="text-xl text-blue-100 mb-6 max-w-2xl">
                  {category.description}
                </p>

                {/* Category Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <span className="font-medium">
                      {category.stats.totalProducts} Products
                    </span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <Star size={16} />
                    <span>{category.stats.averageRating} Avg Rating</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <Tag size={16} />
                    <span>Free Shipping Over $50</span>
                  </div>
                  {category.stats.newArrivals > 0 && (
                    <div className="bg-green-500/30 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <span className="font-medium">
                        {category.stats.newArrivals} New Arrivals
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[200px]">
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold">
                      {filteredProducts.length}
                    </div>
                    <div className="text-sm text-blue-200">Products Found</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">
                      $
                      {Math.min(
                        ...filteredProducts.map((p) => p.price),
                      ).toFixed(2)}{" "}
                      - $
                      {Math.max(
                        ...filteredProducts.map((p) => p.price),
                      ).toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-200">Price Range</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sliders size={20} />
                  Filters
                </h2>
                {(minPrice > category.filters.price.min ||
                  maxPrice < category.filters.price.max ||
                  selectedBrands.length > 0 ||
                  selectedFeatures.length > 0) && (
                  <Link
                    href={`/categories/${slug}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Clear All
                  </Link>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Price Range
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      ${minPrice}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      ${maxPrice}
                    </span>
                  </div>
                  {/* In a real app, this would be an interactive range slider */}
                  <div className="space-y-2">
                    {[
                      { label: "Under $25", max: 25 },
                      { label: "$25 - $50", min: 25, max: 50 },
                      { label: "$50 - $100", min: 50, max: 100 },
                      { label: "$100 - $200", min: 100, max: 200 },
                      { label: "Over $200", min: 200 },
                    ].map((range) => {
                      const isActive =
                        (range.min === undefined || minPrice >= range.min) &&
                        (range.max === undefined || maxPrice <= range.max);

                      return (
                        <Link
                          key={range.label}
                          href={`/categories/${slug}?${createQueryString({
                            min: range.min || category.filters.price.min,
                            max: range.max || category.filters.price.max,
                            brands: selectedBrands.join(","),
                            features: selectedFeatures.join(","),
                            sort: selectedSort,
                            view,
                          })}`}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          {range.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Brands Filter */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Brands
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {category.filters.brands.map((brand) => {
                    const isSelected = selectedBrands.includes(brand);
                    const brandProductCount = filteredProducts.filter(
                      (p) => p.brand === brand,
                    ).length;

                    return (
                      <Link
                        key={brand}
                        href={`/categories/${slug}?${createQueryString({
                          min: minPrice,
                          max: maxPrice,
                          brands: isSelected
                            ? selectedBrands
                                .filter((b) => b !== brand)
                                .join(",")
                            : [...selectedBrands, brand].join(","),
                          features: selectedFeatures.join(","),
                          sort: selectedSort,
                          view,
                        })}`}
                        className="flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-4 w-4 rounded border flex items-center justify-center ${
                              isSelected
                                ? "bg-blue-600 border-blue-600"
                                : "border-gray-300 dark:border-gray-700 group-hover:border-blue-500"
                            }`}
                          >
                            {isSelected && (
                              <div className="h-2 w-2 rounded-sm bg-white"></div>
                            )}
                          </div>
                          <span
                            className={`text-sm ${
                              isSelected
                                ? "text-blue-600 dark:text-blue-400 font-medium"
                                : "text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                            }`}
                          >
                            {brand}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {brandProductCount}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Features Filter */}
              {category.filters.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                    Features
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {category.filters.features.map((feature) => {
                      const isSelected = selectedFeatures.includes(feature);
                      const featureProductCount = filteredProducts.filter((p) =>
                        p.tags?.includes(feature),
                      ).length;

                      return (
                        <Link
                          key={feature}
                          href={`/categories/${slug}?${createQueryString({
                            min: minPrice,
                            max: maxPrice,
                            brands: selectedBrands.join(","),
                            features: isSelected
                              ? selectedFeatures
                                  .filter((f) => f !== feature)
                                  .join(",")
                              : [...selectedFeatures, feature].join(","),
                            sort: selectedSort,
                            view,
                          })}`}
                          className="flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-4 w-4 rounded border flex items-center justify-center ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-gray-300 dark:border-gray-700 group-hover:border-blue-500"
                              }`}
                            >
                              {isSelected && (
                                <div className="h-2 w-2 rounded-sm bg-white"></div>
                              )}
                            </div>
                            <span
                              className={`text-sm ${
                                isSelected
                                  ? "text-blue-600 dark:text-blue-400 font-medium"
                                  : "text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                              }`}
                            >
                              {feature}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {featureProductCount}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock Filter */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Stock Status
                </h3>
                <div className="space-y-3">
                  <Link
                    href={`/categories/${slug}?${createQueryString({
                      min: minPrice,
                      max: maxPrice,
                      brands: selectedBrands.join(","),
                      features: selectedFeatures.join(","),
                      sort: selectedSort,
                      view,
                    })}`}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded border border-gray-300 dark:border-gray-700"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        In Stock (
                        {filteredProducts.filter((p) => p.stock > 0).length})
                      </span>
                    </div>
                  </Link>
                  <Link
                    href={`/categories/${slug}?${createQueryString({
                      min: minPrice,
                      max: maxPrice,
                      brands: selectedBrands.join(","),
                      features: selectedFeatures.join(","),
                      sort: selectedSort,
                      view,
                    })}`}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded border border-gray-300 dark:border-gray-700"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        On Sale (
                        {filteredProducts.filter((p) => p.comparePrice).length})
                      </span>
                    </div>
                  </Link>
                  <Link
                    href={`/categories/${slug}?${createQueryString({
                      min: minPrice,
                      max: maxPrice,
                      brands: selectedBrands.join(","),
                      features: selectedFeatures.join(","),
                      sort: selectedSort,
                      view,
                    })}`}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded border border-gray-300 dark:border-gray-700"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Featured (
                        {filteredProducts.filter((p) => p.isFeatured).length})
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Category Navigation */}
            <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                More Categories
              </h3>
              <div className="space-y-3">
                {categories
                  .filter((cat) => cat.slug !== slug)
                  .map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/categories/${cat.slug}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {cat.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {cat.products.length}
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          </aside>

          {/* Products Section */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4 md:p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 dark:text-gray-400">
                    Showing{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {filteredProducts.length}
                    </span>{" "}
                    of {category.products.length} products
                  </span>

                  {/* Active Filters */}
                  {(minPrice > category.filters.price.min ||
                    maxPrice < category.filters.price.max ||
                    selectedBrands.length > 0 ||
                    selectedFeatures.length > 0) && (
                    <div className="flex flex-wrap gap-2">
                      {(minPrice > category.filters.price.min ||
                        maxPrice < category.filters.price.max) && (
                        <Link
                          href={`/categories/${slug}?${createQueryString({
                            min: category.filters.price.min,
                            max: category.filters.price.max,
                            brands: selectedBrands.join(","),
                            features: selectedFeatures.join(","),
                            sort: selectedSort,
                            view,
                          })}`}
                          className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                        >
                          <span>
                            ${minPrice} - ${maxPrice}
                          </span>
                          <X size={14} />
                        </Link>
                      )}
                      {selectedBrands.map((brand) => (
                        <Link
                          key={brand}
                          href={`/categories/${slug}?${createQueryString({
                            min: minPrice,
                            max: maxPrice,
                            brands: selectedBrands
                              .filter((b) => b !== brand)
                              .join(","),
                            features: selectedFeatures.join(","),
                            sort: selectedSort,
                            view,
                          })}`}
                          className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                        >
                          <span>{brand}</span>
                          <X size={14} />
                        </Link>
                      ))}
                      {selectedFeatures.map((feature) => (
                        <Link
                          key={feature}
                          href={`/categories/${slug}?${createQueryString({
                            min: minPrice,
                            max: maxPrice,
                            brands: selectedBrands.join(","),
                            features: selectedFeatures
                              .filter((f) => f !== feature)
                              .join(","),
                            sort: selectedSort,
                            view,
                          })}`}
                          className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                        >
                          <span>{feature}</span>
                          <X size={14} />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* View Toggle */}
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <Link
                      href={`/categories/${slug}?${createQueryString({
                        min: minPrice,
                        max: maxPrice,
                        brands: selectedBrands.join(","),
                        features: selectedFeatures.join(","),
                        sort: selectedSort,
                        view: "grid",
                      })}`}
                      className={`p-2 rounded ${view === "grid" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                    >
                      <Grid size={20} />
                    </Link>
                    <Link
                      href={`/categories/${slug}?${createQueryString({
                        min: minPrice,
                        max: maxPrice,
                        brands: selectedBrands.join(","),
                        features: selectedFeatures.join(","),
                        sort: selectedSort,
                        view: "list",
                      })}`}
                      className={`p-2 rounded ${view === "list" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                    >
                      <List size={20} />
                    </Link>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedSort}
                      onChange={(e) => {
                        const url = `/categories/${slug}?${createQueryString({
                          min: minPrice,
                          max: maxPrice,
                          brands: selectedBrands.join(","),
                          features: selectedFeatures.join(","),
                          sort: e.target.value,
                          view,
                        })}`;
                        window.location.href = url;
                      }}
                      className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white pl-4 pr-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
                    >
                      {sortOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <option key={option.value} value={option.value}>
                            Sort by: {option.label}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
                <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="text-gray-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Try adjusting your filters or browse other categories
                </p>
                <Link href={`/categories/${slug}`} className="inline-block">
                  <Button className="gap-2">Clear All Filters</Button>
                </Link>
              </div>
            ) : view === "list" ? (
              // List View
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Product Image */}
                      <div className="md:w-48 flex-shrink-0">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900">
                            <span className="text-5xl">🛒</span>
                          </div>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <div className="mb-2">
                              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                {product.category}
                              </span>
                              {product.brand && (
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-3">
                                  by {product.brand}
                                </span>
                              )}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              <Link
                                href={`/products/${product.slug}`}
                                className="hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                {product.name}
                              </Link>
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              {product.description}
                            </p>

                            {/* Tags */}
                            {product.tags && product.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {product.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                              <div className="flex text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={16}
                                    fill={
                                      i < Math.floor(product.averageRating || 0)
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {product.averageRating?.toFixed(1)} (
                                {product.reviewCount} reviews)
                              </span>
                            </div>
                          </div>

                          {/* Price & Actions */}
                          <div className="flex-shrink-0">
                            <div className="text-right mb-4">
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${product.price.toFixed(2)}
                              </div>
                              {product.comparePrice && (
                                <div className="text-lg line-through text-gray-400 dark:text-gray-600">
                                  ${product.comparePrice.toFixed(2)}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              <Link href={`/products/${product.slug}`}>
                                <Button variant="outline" className="w-full">
                                  View Details
                                </Button>
                              </Link>
                              <Button className="w-full gap-2">
                                <span>Add to Cart</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Grid View (using your ProductCard)
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2">
                  <Button variant="outline" size="icon" disabled>
                    <ChevronDown className="rotate-90" size={16} />
                  </Button>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <Button
                      key={page}
                      variant={page === 1 ? "default" : "outline"}
                      size="icon"
                      className="w-10 h-10"
                    >
                      {page}
                    </Button>
                  ))}
                  <Button variant="outline" size="icon">
                    <ChevronDown className="-rotate-90" size={16} />
                  </Button>
                </nav>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
