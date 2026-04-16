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
import { Product, Category } from "@/types";

// Define the structure for category data
interface CategoryData {
  slug: string;
  name: string;
  description: string;
  category: Category;
  products: Product[];
  filters: {
    price: { min: number; max: number };
    brands: string[];
    features: string[];
  };
  stats: {
    averageRating: number;
    totalProducts: number;
    newArrivals: number;
  };
}

// Helper function to get category name safely
const getCategoryName = (category: Category | string): string => {
  if (typeof category === "string") {
    return category;
  } else {
    return category.name;
  }
};

// Helper function to get category object safely
const getCategoryObject = (category: Category | string): Category | null => {
  if (typeof category === "string") {
    return {
      _id: "",
      name: category,
      slug: category.toLowerCase().replace(/\s+/g, "-"),
      featured: false,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } else {
    return category;
  }
};

// Mock data with proper Category objects
const categories: CategoryData[] = [
  {
    slug: "electronics",
    name: "Electronics",
    description: "Latest gadgets and tech devices",
    category: {
      _id: "cat-1",
      slug: "electronics",
      name: "Electronics",
      description: "Latest gadgets and tech devices",
      image: {
        url: "/images/categories/electronics.jpg",
        altText: "Electronics Category",
      },
      isActive: true,
      featured: true,
      sortOrder: 1,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    products: [
      {
        _id: "1",
        sku: "ELEC-001",
        slug: "wireless-headphones",
        name: "Wireless Headphones",
        description:
          "Noise-cancelling over-ear headphones with 30hr battery life",
        price: 129.99,
        comparePrice: 199.99,
        averageRating: 4.5,
        reviewCount: 128,
        images: [
          {
            url: "/images/products/headphones.jpg",
            publicId: "headphones-001",
            thumbnail: "/images/products/headphones-thumb.jpg",
            alt: "Wireless Headphones",
          },
        ],
        category: {
          _id: "cat-1",
          slug: "electronics",
          name: "Electronics",
          description: "Latest gadgets and tech devices",
          image: {
            url: "/images/categories/electronics.jpg",
            altText: "Electronics Category",
          },
          isActive: true,
          featured: true,
          sortOrder: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        stock: 15,
        isFeatured: true,
        isActive: true,
        tags: ["Wireless", "Noise Cancelling"],
        brand: "Sony",
        createdAt: "2024-01-15T00:00:00.000Z",
        updatedAt: "2024-01-15T00:00:00.000Z",
      },
      {
        _id: "2",
        sku: "ELEC-002",
        slug: "smart-watch",
        name: "Smart Watch",
        description: "Fitness tracking and smart notifications",
        price: 249.99,
        comparePrice: 299.99,
        averageRating: 4.7,
        reviewCount: 89,
        images: [
          {
            url: "/images/products/watch.jpg",
            publicId: "watch-001",
            thumbnail: "/images/products/watch-thumb.jpg",
            alt: "Smart Watch",
          },
        ],
        category: {
          _id: "cat-1",
          slug: "electronics",
          name: "Electronics",
          description: "Latest gadgets and tech devices",
          image: {
            url: "/images/categories/electronics.jpg",
            altText: "Electronics Category",
          },
          isActive: true,
          featured: true,
          sortOrder: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        stock: 8,
        isFeatured: false,
        isActive: true,
        tags: ["Fitness", "Smart"],
        brand: "Apple",
        createdAt: "2024-01-20T00:00:00.000Z",
        updatedAt: "2024-01-20T00:00:00.000Z",
      },
      {
        _id: "3",
        sku: "ELEC-003",
        slug: "laptop-stand",
        name: "Laptop Stand",
        description: "Adjustable aluminum laptop stand for ergonomic working",
        price: 34.99,
        comparePrice: 49.99,
        averageRating: 4.3,
        reviewCount: 56,
        images: [
          {
            url: "/images/products/laptop-stand.jpg",
            publicId: "laptop-stand-001",
            thumbnail: "/images/products/laptop-stand-thumb.jpg",
            alt: "Laptop Stand",
          },
        ],
        category: {
          _id: "cat-1",
          slug: "electronics",
          name: "Electronics",
          description: "Latest gadgets and tech devices",
          image: {
            url: "/images/categories/electronics.jpg",
            altText: "Electronics Category",
          },
          isActive: true,
          featured: true,
          sortOrder: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        stock: 25,
        isFeatured: true,
        isActive: true,
        tags: ["Ergonomic", "Adjustable"],
        brand: "Rain Design",
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
      },
      {
        _id: "4",
        sku: "ELEC-004",
        slug: "usb-c-hub",
        name: "USB-C Hub",
        description:
          "7-in-1 USB-C hub with 4K HDMI, USB 3.0, and SD card slots",
        price: 59.99,
        averageRating: 4.6,
        reviewCount: 42,
        images: [
          {
            url: "/images/products/usb-hub.jpg",
            publicId: "usb-hub-001",
            thumbnail: "/images/products/usb-hub-thumb.jpg",
            alt: "USB-C Hub",
          },
        ],
        category: {
          _id: "cat-1",
          slug: "electronics",
          name: "Electronics",
          description: "Latest gadgets and tech devices",
          image: {
            url: "/images/categories/electronics.jpg",
            altText: "Electronics Category",
          },
          isActive: true,
          featured: true,
          sortOrder: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        stock: 30,
        isFeatured: false,
        isActive: true,
        tags: ["7-in-1", "4K"],
        brand: "Anker",
        createdAt: "2024-01-05T00:00:00.000Z",
        updatedAt: "2024-01-05T00:00:00.000Z",
      },
      {
        _id: "5",
        sku: "ELEC-005",
        slug: "portable-speaker",
        name: "Portable Speaker",
        description: "Waterproof Bluetooth speaker with 20hr battery",
        price: 89.99,
        comparePrice: 119.99,
        averageRating: 4.4,
        reviewCount: 73,
        images: [
          {
            url: "/images/products/speaker.jpg",
            publicId: "speaker-001",
            thumbnail: "/images/products/speaker-thumb.jpg",
            alt: "Portable Speaker",
          },
        ],
        category: {
          _id: "cat-1",
          slug: "electronics",
          name: "Electronics",
          description: "Latest gadgets and tech devices",
          image: {
            url: "/images/categories/electronics.jpg",
            altText: "Electronics Category",
          },
          isActive: true,
          featured: true,
          sortOrder: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        stock: 12,
        isFeatured: true,
        isActive: true,
        tags: ["Waterproof", "Bluetooth"],
        brand: "JBL",
        createdAt: "2024-01-12T00:00:00.000Z",
        updatedAt: "2024-01-12T00:00:00.000Z",
      },
      {
        _id: "6",
        sku: "ELEC-006",
        slug: "mechanical-keyboard",
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with customizable switches",
        price: 79.99,
        averageRating: 4.8,
        reviewCount: 31,
        images: [
          {
            url: "/images/products/keyboard.jpg",
            publicId: "keyboard-001",
            thumbnail: "/images/products/keyboard-thumb.jpg",
            alt: "Mechanical Keyboard",
          },
        ],
        category: {
          _id: "cat-1",
          slug: "electronics",
          name: "Electronics",
          description: "Latest gadgets and tech devices",
          image: {
            url: "/images/categories/electronics.jpg",
            altText: "Electronics Category",
          },
          isActive: true,
          featured: true,
          sortOrder: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        stock: 18,
        isFeatured: false,
        isActive: true,
        tags: ["Mechanical", "RGB"],
        brand: "Logitech",
        createdAt: "2024-01-18T00:00:00.000Z",
        updatedAt: "2024-01-18T00:00:00.000Z",
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
    category: {
      _id: "cat-2",
      slug: "fashion",
      name: "Fashion",
      description: "Stylish clothing and accessories for every occasion",
      image: {
        url: "/images/categories/fashion.jpg",
        altText: "Fashion Category",
      },
      isActive: true,
      featured: true,
      sortOrder: 2,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    products: [
      {
        _id: "7",
        sku: "FASH-001",
        slug: "cotton-t-shirt",
        name: "Organic Cotton T-Shirt",
        description: "Premium organic cotton t-shirt with slim fit design",
        price: 24.99,
        averageRating: 4.2,
        reviewCount: 94,
        images: [
          {
            url: "/images/products/t-shirt.jpg",
            publicId: "t-shirt-001",
            thumbnail: "/images/products/t-shirt-thumb.jpg",
            alt: "Organic Cotton T-Shirt",
          },
        ],
        category: {
          _id: "cat-2",
          slug: "fashion",
          name: "Fashion",
          description: "Stylish clothing and accessories for every occasion",
          image: {
            url: "/images/categories/fashion.jpg",
            altText: "Fashion Category",
          },
          isActive: true,
          featured: true,
          sortOrder: 2,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        stock: 50,
        isFeatured: true,
        isActive: true,
        tags: ["Organic", "Slim Fit"],
        brand: "Patagonia",
        createdAt: "2024-01-08T00:00:00.000Z",
        updatedAt: "2024-01-08T00:00:00.000Z",
      },
      {
        _id: "8",
        sku: "FASH-002",
        slug: "denim-jeans",
        name: "Slim Fit Denim Jeans",
        description: "Classic denim jeans with modern slim fit",
        price: 89.99,
        comparePrice: 119.99,
        averageRating: 4.5,
        reviewCount: 67,
        images: [
          {
            url: "/images/products/jeans.jpg",
            publicId: "jeans-001",
            thumbnail: "/images/products/jeans-thumb.jpg",
            alt: "Slim Fit Denim Jeans",
          },
        ],
        category: {
          _id: "cat-2",
          slug: "fashion",
          name: "Fashion",
          description: "Stylish clothing and accessories for every occasion",
          image: {
            url: "/images/categories/fashion.jpg",
            altText: "Fashion Category",
          },
          isActive: true,
          featured: true,
          sortOrder: 2,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        stock: 22,
        isFeatured: false,
        isActive: true,
        tags: ["Denim", "Slim Fit"],
        brand: "Levi's",
        createdAt: "2024-01-14T00:00:00.000Z",
        updatedAt: "2024-01-14T00:00:00.000Z",
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
    category: {
      _id: "cat-3",
      slug: "home",
      name: "Home & Garden",
      description: "Everything you need to make your house a home",
      image: {
        url: "/images/categories/home.jpg",
        altText: "Home & Garden Category",
      },
      isActive: true,
      featured: false,
      sortOrder: 3,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    products: [
      {
        _id: "9",
        sku: "HOME-001",
        slug: "ceramic-mug",
        name: "Handmade Ceramic Mug",
        description: "Artisan ceramic mug with unique hand-painted design",
        price: 18.99,
        averageRating: 4.7,
        reviewCount: 128,
        images: [
          {
            url: "/images/products/mug.jpg",
            publicId: "mug-001",
            thumbnail: "/images/products/mug-thumb.jpg",
            alt: "Handmade Ceramic Mug",
          },
        ],
        category: {
          _id: "cat-3",
          slug: "home",
          name: "Home & Garden",
          description: "Everything you need to make your house a home",
          image: {
            url: "/images/categories/home.jpg",
            altText: "Home & Garden Category",
          },
          isActive: true,
          featured: false,
          sortOrder: 3,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        stock: 100,
        isFeatured: true,
        isActive: true,
        tags: ["Handmade", "Artisan"],
        brand: "Local Artisan",
        createdAt: "2024-01-03T00:00:00.000Z",
        updatedAt: "2024-01-03T00:00:00.000Z",
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

  const categoryData = categories.find((cat) => cat.slug === slug);

  if (!categoryData) {
    notFound();
  }

  // Parse search params for filtering/sorting
  const selectedSort =
    typeof searchParamsObj.sort === "string"
      ? searchParamsObj.sort
      : "featured";
  const minPrice = searchParamsObj.min
    ? Number(searchParamsObj.min)
    : categoryData.filters.price.min;
  const maxPrice = searchParamsObj.max
    ? Number(searchParamsObj.max)
    : categoryData.filters.price.max;
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
  let filteredProducts = [...categoryData.products];

  // Apply price filter
  filteredProducts = filteredProducts.filter(
    (product) => product.price >= minPrice && product.price <= maxPrice,
  );

  // Apply brand filter
  if (selectedBrands.length > 0 && selectedBrands[0] !== "") {
    filteredProducts = filteredProducts.filter(
      (product) => product.brand && selectedBrands.includes(product.brand),
    );
  }

  // Apply feature/tag filter
  if (selectedFeatures.length > 0 && selectedFeatures[0] !== "") {
    filteredProducts = filteredProducts.filter((product) =>
      product.tags?.some((tag: string) => selectedFeatures.includes(tag)),
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
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
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
    <div className="min-h-screen bg-[#FDF8F5] dark:bg-[#2C2C2C]">
      {/* Category Hero - Earthy Gradient */}
      <div className="bg-gradient-to-r from-[#2C3E3E] to-[#4A6B6B] text-white">
        <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="max-w-4xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-[#D4C4B7] mb-6">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronDown size={14} className="-rotate-90" />
              <Link
                href="/categories"
                className="hover:text-white transition-colors"
              >
                Categories
              </Link>
              <ChevronDown size={14} className="-rotate-90" />
              <span className="font-medium text-white">
                {categoryData.name}
              </span>
            </nav>

            {/* Category Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  {categoryData.name}
                </h1>
                <p className="text-xl text-[#D4C4B7] mb-6 max-w-2xl">
                  {categoryData.description}
                </p>

                {/* Category Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <span className="font-medium">
                      {categoryData.stats.totalProducts} Products
                    </span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <Star size={16} />
                    <span>{categoryData.stats.averageRating} Avg Rating</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <Tag size={16} />
                    <span>Free Shipping Over $50</span>
                  </div>
                  {categoryData.stats.newArrivals > 0 && (
                    <div className="bg-[#6B8E6B]/50 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <span className="font-medium">
                        {categoryData.stats.newArrivals} New Arrivals
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
                    <div className="text-sm text-[#D4C4B7]">Products Found</div>
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
                    <div className="text-sm text-[#D4C4B7]">Price Range</div>
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
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sticky top-24 border border-[#E8E0D8] dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#2C2C2C] dark:text-white flex items-center gap-2">
                  <Sliders size={20} />
                  Filters
                </h2>
                {(minPrice > categoryData.filters.price.min ||
                  maxPrice < categoryData.filters.price.max ||
                  selectedBrands.length > 0 ||
                  selectedFeatures.length > 0) && (
                  <Link
                    href={`/categories/${slug}`}
                    className="text-sm text-[#C17B4D] hover:text-[#D49A6A] transition-colors"
                  >
                    Clear All
                  </Link>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="mb-8">
                <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-4">
                  Price Range
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6B6B6B] dark:text-gray-400">
                      ${minPrice}
                    </span>
                    <span className="text-[#6B6B6B] dark:text-gray-400">
                      ${maxPrice}
                    </span>
                  </div>
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
                            min: range.min || categoryData.filters.price.min,
                            max: range.max || categoryData.filters.price.max,
                            brands: selectedBrands.join(","),
                            features: selectedFeatures.join(","),
                            sort: selectedSort,
                            view,
                          })}`}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive
                              ? "bg-[#C17B4D]/10 text-[#C17B4D] font-medium"
                              : "text-[#6B6B6B] dark:text-gray-300 hover:bg-[#F4EFEA] dark:hover:bg-gray-800"
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
                <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-4">
                  Brands
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {categoryData.filters.brands.map((brand) => {
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
                            className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-[#C17B4D] border-[#C17B4D]"
                                : "border-[#E8E0D8] dark:border-gray-700 group-hover:border-[#C17B4D]"
                            }`}
                          >
                            {isSelected && (
                              <div className="h-2 w-2 rounded-sm bg-white"></div>
                            )}
                          </div>
                          <span
                            className={`text-sm transition-colors ${
                              isSelected
                                ? "text-[#C17B4D] font-medium"
                                : "text-[#6B6B6B] dark:text-gray-300 group-hover:text-[#C17B4D]"
                            }`}
                          >
                            {brand}
                          </span>
                        </div>
                        <span className="text-xs text-[#6B6B6B] dark:text-gray-400">
                          {brandProductCount}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Features Filter */}
              {categoryData.filters.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-4">
                    Features
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {categoryData.filters.features.map((feature) => {
                      const isSelected = selectedFeatures.includes(feature);
                      const featureProductCount = filteredProducts.filter((p) =>
                        p.tags?.some((tag: string) => tag === feature),
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
                              className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-[#C17B4D] border-[#C17B4D]"
                                  : "border-[#E8E0D8] dark:border-gray-700 group-hover:border-[#C17B4D]"
                              }`}
                            >
                              {isSelected && (
                                <div className="h-2 w-2 rounded-sm bg-white"></div>
                              )}
                            </div>
                            <span
                              className={`text-sm transition-colors ${
                                isSelected
                                  ? "text-[#C17B4D] font-medium"
                                  : "text-[#6B6B6B] dark:text-gray-300 group-hover:text-[#C17B4D]"
                              }`}
                            >
                              {feature}
                            </span>
                          </div>
                          <span className="text-xs text-[#6B6B6B] dark:text-gray-400">
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
                <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-4">
                  Stock Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded border border-[#E8E0D8] dark:border-gray-700"></div>
                      <span className="text-sm text-[#6B6B6B] dark:text-gray-300">
                        In Stock (
                        {filteredProducts.filter((p) => p.stock > 0).length})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded border border-[#E8E0D8] dark:border-gray-700"></div>
                      <span className="text-sm text-[#6B6B6B] dark:text-gray-300">
                        On Sale (
                        {filteredProducts.filter((p) => p.comparePrice).length})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded border border-[#E8E0D8] dark:border-gray-700"></div>
                      <span className="text-sm text-[#6B6B6B] dark:text-gray-300">
                        Featured (
                        {filteredProducts.filter((p) => p.isFeatured).length})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Navigation */}
            <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-[#E8E0D8] dark:border-gray-800">
              <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-4">
                More Categories
              </h3>
              <div className="space-y-3">
                {categories
                  .filter((cat) => cat.slug !== slug)
                  .map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/categories/${cat.slug}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F4EFEA] dark:hover:bg-gray-800 transition-colors group"
                    >
                      <span className="text-[#6B6B6B] dark:text-gray-300 group-hover:text-[#C17B4D] transition-colors">
                        {cat.name}
                      </span>
                      <span className="text-sm text-[#6B6B6B] dark:text-gray-400">
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
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4 md:p-6 mb-6 border border-[#E8E0D8] dark:border-gray-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-[#6B6B6B] dark:text-gray-400">
                    Showing{" "}
                    <span className="font-bold text-[#2C2C2C] dark:text-white">
                      {filteredProducts.length}
                    </span>{" "}
                    of {categoryData.products.length} products
                  </span>

                  {/* Active Filters */}
                  {(minPrice > categoryData.filters.price.min ||
                    maxPrice < categoryData.filters.price.max ||
                    selectedBrands.length > 0 ||
                    selectedFeatures.length > 0) && (
                    <div className="flex flex-wrap gap-2">
                      {(minPrice > categoryData.filters.price.min ||
                        maxPrice < categoryData.filters.price.max) && (
                        <Link
                          href={`/categories/${slug}?${createQueryString({
                            min: categoryData.filters.price.min,
                            max: categoryData.filters.price.max,
                            brands: selectedBrands.join(","),
                            features: selectedFeatures.join(","),
                            sort: selectedSort,
                            view,
                          })}`}
                          className="flex items-center gap-1 bg-[#C17B4D]/10 text-[#C17B4D] px-3 py-1 rounded-full text-sm hover:bg-[#C17B4D]/20 transition-colors"
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
                          className="flex items-center gap-1 bg-[#C17B4D]/10 text-[#C17B4D] px-3 py-1 rounded-full text-sm hover:bg-[#C17B4D]/20 transition-colors"
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
                          className="flex items-center gap-1 bg-[#C17B4D]/10 text-[#C17B4D] px-3 py-1 rounded-full text-sm hover:bg-[#C17B4D]/20 transition-colors"
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
                  <div className="flex items-center gap-2 bg-[#F4EFEA] dark:bg-gray-800 p-1 rounded-lg">
                    <Link
                      href={`/categories/${slug}?${createQueryString({
                        min: minPrice,
                        max: maxPrice,
                        brands: selectedBrands.join(","),
                        features: selectedFeatures.join(","),
                        sort: selectedSort,
                        view: "grid",
                      })}`}
                      className={`p-2 rounded transition-colors ${
                        view === "grid"
                          ? "bg-white dark:bg-gray-700 text-[#2C3E3E] dark:text-white shadow-sm"
                          : "text-[#6B6B6B] hover:text-[#C17B4D]"
                      }`}
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
                      className={`p-2 rounded transition-colors ${
                        view === "list"
                          ? "bg-white dark:bg-gray-700 text-[#2C3E3E] dark:text-white shadow-sm"
                          : "text-[#6B6B6B] hover:text-[#C17B4D]"
                      }`}
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
                      className="appearance-none bg-white dark:bg-gray-800 border border-[#E8E0D8] dark:border-gray-700 text-[#2C2C2C] dark:text-white pl-4 pr-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C17B4D] cursor-pointer text-sm"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          Sort by: {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-[#E8E0D8] dark:border-gray-800">
                <div className="h-20 w-20 bg-[#F4EFEA] dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="text-[#6B6B6B]" size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-3">
                  No products found
                </h3>
                <p className="text-[#6B6B6B] dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Try adjusting your filters or browse other categories
                </p>
                <Link href={`/categories/${slug}`} className="inline-block">
                  <Button className="gap-2 bg-[#2C3E3E] hover:bg-[#4A6B6B]">
                    Clear All Filters
                  </Button>
                </Link>
              </div>
            ) : view === "list" ? (
              // List View
              <div className="space-y-4">
                {filteredProducts.map((product) => {
                  const categoryName = getCategoryName(product.category);

                  return (
                    <div
                      key={product._id}
                      className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-[#E8E0D8] dark:border-gray-800 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Product Image */}
                        <div className="md:w-48 flex-shrink-0">
                          <div className="aspect-square bg-[#F4EFEA] dark:bg-gray-800 rounded-xl overflow-hidden">
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#D4C4B7]/20 to-[#C17B4D]/20 dark:from-gray-800 dark:to-gray-900">
                              <span className="text-5xl">🛒</span>
                            </div>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                              <div className="mb-2">
                                <span className="text-sm text-[#C17B4D] font-medium">
                                  {categoryName}
                                </span>
                                {product.brand && (
                                  <span className="text-sm text-[#6B6B6B] dark:text-gray-400 ml-3">
                                    by {product.brand}
                                  </span>
                                )}
                              </div>

                              <h3 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-2">
                                <Link
                                  href={`/products/${product.slug}`}
                                  className="hover:text-[#C17B4D] transition-colors"
                                >
                                  {product.name}
                                </Link>
                              </h3>

                              <p className="text-[#6B6B6B] dark:text-gray-400 mb-4 line-clamp-2">
                                {product.description}
                              </p>

                              {/* Tags */}
                              {product.tags && product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {product.tags.map((tag: string) => (
                                    <span
                                      key={tag}
                                      className="px-3 py-1 bg-[#F4EFEA] dark:bg-gray-800 text-[#6B6B6B] dark:text-gray-300 text-sm rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Rating */}
                              <div className="flex items-center gap-2 mb-4">
                                <div className="flex text-[#C17B4D]">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={16}
                                      fill={
                                        i <
                                        Math.floor(product.averageRating || 0)
                                          ? "currentColor"
                                          : "none"
                                      }
                                      className="cursor-pointer"
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-[#6B6B6B] dark:text-gray-400">
                                  {product.averageRating?.toFixed(1)} (
                                  {product.reviewCount} reviews)
                                </span>
                              </div>
                            </div>

                            {/* Price & Actions */}
                            <div className="flex-shrink-0">
                              <div className="text-right mb-4">
                                <div className="text-2xl font-bold text-[#2C2C2C] dark:text-white">
                                  ${product.price.toFixed(2)}
                                </div>
                                {product.comparePrice && (
                                  <div className="text-sm line-through text-[#6B6B6B] dark:text-gray-500">
                                    ${product.comparePrice.toFixed(2)}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2">
                                <Link href={`/products/${product.slug}`}>
                                  <Button
                                    variant="outline"
                                    className="w-full border-[#E8E0D8] hover:bg-[#F4EFEA]"
                                  >
                                    View Details
                                  </Button>
                                </Link>
                                <Button className="w-full gap-2 bg-[#2C3E3E] hover:bg-[#4A6B6B]">
                                  Add to Cart
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Grid View
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
                  <Button
                    variant="outline"
                    size="icon"
                    disabled
                    className="border-[#E8E0D8] opacity-50"
                  >
                    <ChevronDown className="rotate-90" size={16} />
                  </Button>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <Button
                      key={page}
                      variant={page === 1 ? "default" : "outline"}
                      size="icon"
                      className={`w-10 h-10 ${
                        page === 1
                          ? "bg-[#2C3E3E] hover:bg-[#4A6B6B]"
                          : "border-[#E8E0D8] hover:bg-[#F4EFEA]"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-[#E8E0D8] hover:bg-[#F4EFEA]"
                  >
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
