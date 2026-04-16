import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RefreshCw,
  Check,
  ChevronLeft,
  Package,
  Clock,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { Product } from "@/types";

const products = [
  {
    slug: "wireless-headphones",
    _id: "1",
    name: "Premium Wireless Headphones",
    description:
      "Experience immersive sound with our premium wireless headphones featuring active noise cancellation, 30-hour battery life, and premium comfort for all-day wear.",
    longDescription: `These premium wireless headphones are designed for audiophiles and everyday users alike. With advanced noise-cancellation technology, you can immerse yourself in your music without distractions. The 40mm drivers deliver rich, balanced sound across all frequencies.

Key Features:
• Active Noise Cancellation (ANC) with transparency mode
• 30-hour battery life with quick charge (5 min = 3 hours)
• Premium memory foam ear cushions for all-day comfort
• Multipoint Bluetooth connectivity for two devices
• Built-in microphone for crystal clear calls
• Foldable design with carrying case included
• Touch controls for music and calls
• Voice assistant compatibility (Siri, Google Assistant)

Perfect for travel, work, or relaxation, these headphones provide exceptional audio quality and comfort.`,
    price: 249.99,
    comparePrice: 299.99,
    averageRating: 4.7,
    reviewCount: 128,
    images: [
      {
        url: "/api/placeholder/800/800",
        publicId: "wireless-headphones-1",
        thumbnail: "/api/placeholder/200/200",
        alt: "Wireless Headphones Front",
      },
      {
        url: "/api/placeholder/800/800",
        publicId: "wireless-headphones-2",
        thumbnail: "/api/placeholder/200/200",
        alt: "Wireless Headphones Side",
      },
      {
        url: "/api/placeholder/800/800",
        publicId: "wireless-headphones-3",
        thumbnail: "/api/placeholder/200/200",
        alt: "Wireless Headphones Case",
      },
      {
        url: "/api/placeholder/800/800",
        publicId: "wireless-headphones-4",
        thumbnail: "/api/placeholder/200/200",
        alt: "Wireless Headphones In Use",
      },
    ],
    category: "Electronics",
    stock: 25,
    isFeatured: true,
    tags: ["Wireless", "Noise Cancelling", "Premium", "Bluetooth 5.0"],
    brand: "AudioMaster",
    colors: ["Black", "White", "Silver", "Blue"],
    sizes: ["Standard"],
    specifications: {
      "Driver Size": "40mm",
      "Frequency Response": "20Hz - 20kHz",
      "Battery Life": "30 hours",
      "Charging Time": "2 hours",
      Connectivity: "Bluetooth 5.0, 3.5mm jack",
      Weight: "265g",
      Warranty: "2 years",
    },
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Quick charge technology",
      "Premium memory foam cushions",
      "Foldable design",
      "Carrying case included",
    ],
    relatedProducts: ["2", "3", "4"],
    sku: "HP-001-BLK",
    isActive: true,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    slug: "smart-watch-pro",
    _id: "2",
    name: "Smart Watch Pro",
    description:
      "Advanced smartwatch with fitness tracking, heart rate monitoring, and smartphone notifications.",
    price: 349.99,
    comparePrice: 399.99,
    averageRating: 4.6,
    reviewCount: 89,
    images: [
      {
        url: "/api/placeholder/800/800",
        publicId: "smart-watch-1",
        thumbnail: "/api/placeholder/200/200",
        alt: "Smart Watch",
      },
    ],
    category: "Electronics",
    stock: 15,
    isFeatured: false,
    tags: ["Smartwatch", "Fitness", "Bluetooth"],
    brand: "TechWear",
    colors: ["Black", "Silver", "Rose Gold"],
    sizes: ["Standard"],
    relatedProducts: ["1", "3", "5"],
    sku: "SW-002-BLK",
    isActive: true,
    createdAt: "2024-01-16",
    updatedAt: "2024-01-16",
  },
  {
    slug: "laptop-stand-premium",
    _id: "3",
    name: "Premium Aluminum Laptop Stand",
    description:
      "Ergonomic aluminum laptop stand with adjustable height for better posture and cooling.",
    price: 89.99,
    comparePrice: 119.99,
    averageRating: 4.5,
    reviewCount: 156,
    images: [
      {
        url: "/api/placeholder/800/800",
        publicId: "laptop-stand-1",
        thumbnail: "/api/placeholder/200/200",
        alt: "Laptop Stand",
      },
    ],
    category: "Electronics",
    stock: 50,
    isFeatured: true,
    tags: ["Ergonomic", "Adjustable", "Aluminum"],
    brand: "ErgoTech",
    colors: ["Silver", "Space Gray"],
    sizes: ["13-16 inch"],
    relatedProducts: ["1", "2", "4"],
    sku: "LS-003-SIL",
    isActive: true,
    createdAt: "2024-01-17",
    updatedAt: "2024-01-17",
  },
  {
    slug: "portable-speaker",
    _id: "4",
    name: "Waterproof Portable Speaker",
    description:
      "Bluetooth speaker with 360° sound, waterproof design, and 20-hour battery life.",
    price: 129.99,
    comparePrice: 159.99,
    averageRating: 4.4,
    reviewCount: 203,
    images: [
      {
        url: "/api/placeholder/800/800",
        publicId: "speaker-1",
        thumbnail: "/api/placeholder/200/200",
        alt: "Portable Speaker",
      },
    ],
    category: "Electronics",
    stock: 30,
    isFeatured: false,
    tags: ["Waterproof", "Portable", "360° Sound"],
    brand: "SoundWave",
    colors: ["Black", "Blue", "Red"],
    sizes: ["Standard"],
    relatedProducts: ["1", "3", "5"],
    sku: "SP-004-BLK",
    isActive: true,
    createdAt: "2024-01-18",
    updatedAt: "2024-01-18",
  },
  {
    slug: "mechanical-keyboard",
    _id: "5",
    name: "Mechanical Gaming Keyboard",
    description:
      "RGB mechanical keyboard with customizable switches and anti-ghosting technology.",
    price: 149.99,
    averageRating: 4.8,
    reviewCount: 67,
    images: [
      {
        url: "/api/placeholder/800/800",
        publicId: "keyboard-1",
        thumbnail: "/api/placeholder/200/200",
        alt: "Mechanical Keyboard",
      },
    ],
    category: "Electronics",
    stock: 20,
    isFeatured: true,
    tags: ["Mechanical", "RGB", "Gaming"],
    brand: "GameMaster",
    colors: ["Black", "White"],
    sizes: ["Full Size", "Tenkeyless"],
    relatedProducts: ["1", "2", "3"],
    sku: "KB-005-BLK",
    isActive: true,
    createdAt: "2024-01-19",
    updatedAt: "2024-01-19",
  },
] satisfies Product[];

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product does not exist.",
    };
  }

  return {
    title: `${product.name} | Elista Ecommerce`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.map((img) => ({
        url: img.url,
        alt: img.alt,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: product.images.map((img) => img.url),
    },
    keywords: [...product.tags, product.category, product.brand],
  };
}

// Generate static params for SSG
export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // Find related products
  const related = products
    .filter(
      (p) =>
        p._id !== product._id &&
        (product.relatedProducts?.includes(p._id) ||
          p.category === product.category),
    )
    .slice(0, 4);

  // AddToCart component
  const AddToCart = ({ product }: { product: Product }) => {
    return (
      <Button className="flex-1 py-3 text-lg gap-3 bg-[#2C3E3E] hover:bg-[#4A6B6B] transition-all">
        <ShoppingCart size={20} />
        Add to Cart
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] dark:bg-[#2C2C2C]">
      {/* Breadcrumb */}
      <div className="border-b border-[#E8E0D8] dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-[#6B6B6B] dark:text-gray-400 hover:text-[#C17B4D] dark:hover:text-[#D49A6A] transition-colors"
            >
              Home
            </Link>
            <ChevronLeft size={14} className="rotate-180 text-[#6B6B6B]" />
            <Link
              href="/categories"
              className="text-[#6B6B6B] dark:text-gray-400 hover:text-[#C17B4D] dark:hover:text-[#D49A6A] transition-colors"
            >
              Categories
            </Link>
            <ChevronLeft size={14} className="rotate-180 text-[#6B6B6B]" />
            <Link
              href={`/categories/${product.category.toLowerCase()}`}
              className="text-[#6B6B6B] dark:text-gray-400 hover:text-[#C17B4D] dark:hover:text-[#D49A6A] transition-colors"
            >
              {product.category}
            </Link>
            <ChevronLeft size={14} className="rotate-180 text-[#6B6B6B]" />
            <span className="text-[#2C2C2C] dark:text-white font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Product Images */}
          <div className="lg:w-1/2">
            {/* Main Image */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4 mb-4 border border-[#E8E0D8] dark:border-gray-800">
              <div className="aspect-square rounded-xl bg-linear-to-br from-[#F4EFEA] to-[#E8E0D8] dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden">
                <div className="text-8xl">🎧</div>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className="shrink-0 w-20 h-20 rounded-lg bg-white dark:bg-gray-800 border-2 border-[#E8E0D8] dark:border-gray-700 hover:border-[#C17B4D] dark:hover:border-[#D49A6A] overflow-hidden transition-colors"
                >
                  <div className="w-full h-full flex items-center justify-center bg-[#F4EFEA] dark:bg-gray-700">
                    <span className="text-2xl">🎧</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 flex items-center gap-3 border border-[#E8E0D8] dark:border-gray-800">
                <div className="h-10 w-10 rounded-full bg-[#6B8E6B]/10 dark:bg-[#6B8E6B]/30 flex items-center justify-center">
                  <Truck
                    className="text-[#6B8E6B] dark:text-[#8BAA8B]"
                    size={20}
                  />
                </div>
                <div>
                  <div className="font-medium text-[#2C2C2C] dark:text-white">
                    Free Shipping
                  </div>
                  <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                    On orders over $50
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 flex items-center gap-3 border border-[#E8E0D8] dark:border-gray-800">
                <div className="h-10 w-10 rounded-full bg-[#2C3E3E]/10 dark:bg-[#2C3E3E]/30 flex items-center justify-center">
                  <Shield
                    className="text-[#2C3E3E] dark:text-[#4A6B6B]"
                    size={20}
                  />
                </div>
                <div>
                  <div className="font-medium text-[#2C2C2C] dark:text-white">
                    2-Year Warranty
                  </div>
                  <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                    Manufacturer warranty
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 flex items-center gap-3 border border-[#E8E0D8] dark:border-gray-800">
                <div className="h-10 w-10 rounded-full bg-[#C17B4D]/10 dark:bg-[#C17B4D]/30 flex items-center justify-center">
                  <RefreshCw
                    className="text-[#C17B4D] dark:text-[#D49A6A]"
                    size={20}
                  />
                </div>
                <div>
                  <div className="font-medium text-[#2C2C2C] dark:text-white">
                    30-Day Returns
                  </div>
                  <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                    Easy return policy
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 flex items-center gap-3 border border-[#E8E0D8] dark:border-gray-800">
                <div className="h-10 w-10 rounded-full bg-[#D4C4B7]/20 dark:bg-[#D4C4B7]/30 flex items-center justify-center">
                  <Award
                    className="text-[#C17B4D] dark:text-[#D49A6A]"
                    size={20}
                  />
                </div>
                <div>
                  <div className="font-medium text-[#2C2C2C] dark:text-white">
                    Premium Quality
                  </div>
                  <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                    Verified reviews
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:w-1/2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 border border-[#E8E0D8] dark:border-gray-800">
              {/* Product Header */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Link
                    href={`/categories/${product.category.toLowerCase()}`}
                    className="text-sm font-medium text-[#C17B4D] dark:text-[#D49A6A] hover:underline"
                  >
                    {product.category}
                  </Link>
                  <span className="text-[#E8E0D8]">•</span>
                  <span className="text-sm text-[#6B6B6B] dark:text-gray-400">
                    Brand: <span className="font-medium">{product.brand}</span>
                  </span>
                  {product.isFeatured && (
                    <>
                      <span className="text-[#E8E0D8]">•</span>
                      <span className="px-2 py-1 bg-[#C17B4D]/10 dark:bg-[#C17B4D]/30 text-[#C17B4D] text-xs font-bold rounded-full">
                        Featured
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] dark:text-white mb-4">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex text-[#C17B4D]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          fill={
                            i < Math.floor(product.averageRating)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-[#2C2C2C] dark:text-white">
                      {product.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-[#6B6B6B] dark:text-gray-400">
                    ({product.reviewCount} reviews)
                  </span>
                  <span className="text-[#6B8E6B] dark:text-[#8BAA8B] font-medium">
                    {product.stock > 10
                      ? "In Stock"
                      : product.stock > 0
                        ? "Low Stock"
                        : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-[#2C2C2C] dark:text-white">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.comparePrice && (
                    <>
                      <span className="text-xl line-through text-[#6B6B6B] dark:text-gray-500">
                        ${product.comparePrice.toFixed(2)}
                      </span>
                      <span className="px-2 py-1 bg-[#C17B7B]/10 text-[#C17B7B] font-bold rounded">
                        Save{" "}
                        {Math.round(
                          (1 - product.price / product.comparePrice) * 100,
                        )}
                        %
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[#6B6B6B] dark:text-gray-400">
                  or 4 interest-free payments of $
                  {(product.price / 4).toFixed(2)} with
                  <span className="font-medium ml-1 text-[#C17B4D]">
                    Elista Pay
                  </span>
                </p>
              </div>

              {/* Short Description */}
              <div className="mb-8">
                <p className="text-[#6B6B6B] dark:text-gray-300">
                  {product.description}
                </p>
              </div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-3">
                    Color
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          color === "Black"
                            ? "border-[#C17B4D] bg-[#2C3E3E] text-white"
                            : "border-[#E8E0D8] dark:border-gray-700 hover:border-[#C17B4D]"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-3">
                    Size
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          size === "Standard"
                            ? "border-[#C17B4D] bg-[#C17B4D]/10 text-[#C17B4D] font-medium"
                            : "border-[#E8E0D8] dark:border-gray-700 hover:border-[#C17B4D]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-[#E8E0D8] dark:border-gray-700 rounded-xl overflow-hidden">
                    <button className="h-12 w-12 flex items-center justify-center text-[#6B6B6B] dark:text-gray-400 hover:bg-[#F4EFEA] dark:hover:bg-gray-800 transition-colors">
                      <span className="text-xl">−</span>
                    </button>
                    <div className="h-12 w-16 flex items-center justify-center font-bold text-[#2C2C2C] dark:text-white">
                      1
                    </div>
                    <button className="h-12 w-12 flex items-center justify-center text-[#6B6B6B] dark:text-gray-400 hover:bg-[#F4EFEA] dark:hover:bg-gray-800 transition-colors">
                      <span className="text-xl">+</span>
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <AddToCart product={product} />

                  {/* Wishlist Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 border-[#E8E0D8] hover:bg-[#F4EFEA] hover:border-[#C17B4D] transition-all"
                  >
                    <Heart size={20} className="text-[#C17B4D]" />
                  </Button>
                </div>

                {product.stock < 10 && product.stock > 0 && (
                  <div className="mt-4 p-3 bg-[#C17B4D]/10 rounded-xl border border-[#C17B4D]/20">
                    <div className="flex items-center gap-2 text-[#C17B4D]">
                      <Clock size={16} />
                      <span className="font-medium">
                        Hurry! Only {product.stock} left in stock
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-8">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-[#E8E0D8] hover:bg-[#F4EFEA] hover:border-[#C17B4D] transition-all"
                >
                  <Share2 size={16} />
                  Share
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-[#E8E0D8] hover:bg-[#F4EFEA] hover:border-[#C17B4D] transition-all"
                >
                  <Package size={16} />
                  Compare
                </Button>
              </div>

              {/* Product Features */}
              <div className="space-y-4 pt-4 border-t border-[#E8E0D8] dark:border-gray-800">
                <div className="flex items-center gap-3 text-[#6B6B6B] dark:text-gray-300">
                  <Check className="text-[#6B8E6B]" size={20} />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-3 text-[#6B6B6B] dark:text-gray-300">
                  <Check className="text-[#6B8E6B]" size={20} />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-[#6B6B6B] dark:text-gray-300">
                  <Check className="text-[#6B8E6B]" size={20} />
                  <span>2-year manufacturer warranty</span>
                </div>
                <div className="flex items-center gap-3 text-[#6B6B6B] dark:text-gray-300">
                  <Check className="text-[#6B8E6B]" size={20} />
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-[#E8E0D8] dark:border-gray-800">
            {/* Tab Headers */}
            <div className="border-b border-[#E8E0D8] dark:border-gray-800">
              <div className="flex overflow-x-auto">
                {["Description", "Specifications", "Features", "Reviews"].map(
                  (tab) => (
                    <button
                      key={tab}
                      className={`px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                        tab === "Description"
                          ? "border-[#C17B4D] text-[#C17B4D]"
                          : "border-transparent text-[#6B6B6B] dark:text-gray-400 hover:text-[#2C2C2C] dark:hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8">
              {/* Description Tab */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-[#2C2C2C] dark:text-white mb-6">
                  Product Description
                </h2>
                <div className="text-[#6B6B6B] dark:text-gray-300 whitespace-pre-line">
                  {product.longDescription || product.description}
                </div>
              </div>

              {/* Features List */}
              {product.features && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-4">
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-[#C17B4D]"></div>
                        <span className="text-[#6B6B6B] dark:text-gray-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications Table */}
              {product.specifications && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-4">
                    Specifications
                  </h3>
                  <div className="border border-[#E8E0D8] dark:border-gray-700 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(product.specifications).map(
                          ([key, value], index) => (
                            <tr
                              key={key}
                              className={
                                index % 2 === 0
                                  ? "bg-[#FDF8F5] dark:bg-gray-900/50"
                                  : "bg-white dark:bg-gray-900"
                              }
                            >
                              <td className="px-6 py-4 border-r border-[#E8E0D8] dark:border-gray-800 font-medium text-[#2C2C2C] dark:text-gray-300">
                                {key}
                              </td>
                              <td className="px-6 py-4 text-[#6B6B6B] dark:text-gray-400">
                                {value}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 border border-[#E8E0D8] dark:border-gray-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#2C2C2C] dark:text-white">
                  Customer Reviews
                </h2>
                <p className="text-[#6B6B6B] dark:text-gray-400 mt-2">
                  {product.reviewCount} verified reviews
                </p>
              </div>
              <Button className="bg-[#2C3E3E] hover:bg-[#4A6B6B]">
                Write a Review
              </Button>
            </div>

            {/* Review Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center p-6 bg-[#FDF8F5] dark:bg-gray-800 rounded-xl border border-[#E8E0D8] dark:border-gray-700">
                <div className="text-5xl font-bold text-[#2C2C2C] dark:text-white mb-2">
                  {product.averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      fill={
                        i < Math.floor(product.averageRating)
                          ? "currentColor"
                          : "none"
                      }
                      className="text-[#C17B4D]"
                    />
                  ))}
                </div>
                <div className="text-[#6B6B6B] dark:text-gray-400">
                  Overall Rating
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const percentage = Math.random() * 30 + 70; // Mock data
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm font-medium text-[#2C2C2C] dark:text-white">
                            {stars}
                          </span>
                          <Star size={14} className="text-[#C17B4D]" />
                        </div>
                        <div className="flex-1 h-2 bg-[#F4EFEA] dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#C17B4D] rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-[#6B6B6B] dark:text-gray-400 w-12 text-right">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sample Reviews */}
            <div className="space-y-6">
              {[1, 2, 3].map((review) => (
                <div
                  key={review}
                  className="border-b border-[#E8E0D8] dark:border-gray-800 pb-6 last:border-0"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-[#2C2C2C] dark:text-white">
                        Excellent Product!
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-[#C17B4D]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </div>
                        <span className="text-sm text-[#6B6B6B] dark:text-gray-400">
                          by Alex Johnson • 2 weeks ago
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-[#6B8E6B]">
                      Verified Purchase
                    </div>
                  </div>
                  <p className="text-[#6B6B6B] dark:text-gray-300">
                    Absolutely love these headphones! The noise cancellation is
                    incredible and the battery life lasts through my entire work
                    week. Highly recommend!
                  </p>
                  <div className="flex gap-2 mt-4">
                    <span className="px-2 py-1 bg-[#F4EFEA] dark:bg-gray-800 text-[#6B6B6B] dark:text-gray-300 text-xs rounded">
                      Great Sound
                    </span>
                    <span className="px-2 py-1 bg-[#F4EFEA] dark:bg-gray-800 text-[#6B6B6B] dark:text-gray-300 text-xs rounded">
                      Comfortable
                    </span>
                    <span className="px-2 py-1 bg-[#F4EFEA] dark:bg-gray-800 text-[#6B6B6B] dark:text-gray-300 text-xs rounded">
                      Long Battery
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button
                variant="outline"
                className="border-[#E8E0D8] hover:bg-[#F4EFEA] hover:border-[#C17B4D]"
              >
                Load More Reviews
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#2C2C2C] dark:text-white">
                You May Also Like
              </h2>
              <Link
                href={`/categories/${product.category.toLowerCase()}`}
                className="text-[#C17B4D] hover:text-[#D49A6A] transition-colors font-medium"
              >
                View All {product.category}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#2C2C2C] dark:text-white mb-8">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
