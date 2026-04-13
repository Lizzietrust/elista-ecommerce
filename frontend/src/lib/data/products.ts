import { productApi } from "@/lib/api/products";
import { Product } from "@/types";

interface GetProductsParams {
  category?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
}

interface ApiImage {
  url: string;
}

interface ApiCategory {
  name: string;
}

interface ApiProduct {
  _id: string;
  slug?: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: ApiImage[];
  category?: ApiCategory;
  brand?: string;
  averageRating?: number;
  ratingsCount?: number;
  stock: number;
  createdAt: string;
  specifications?: Record<string, unknown>;
  sku?: string;
  isFeatured?: boolean;
}

interface ApiResponse {
  data: ApiProduct[];
  total: number;
}

export async function getProducts(params: GetProductsParams = {}): Promise<{
  products: Product[];
  totalCount: number;
  categories: string[];
  brands: string[];
}> {
  const {
    category,
    sort = "-createdAt",
    minPrice,
    maxPrice,
    searchQuery,
    page = 1,
    pageSize = 12,
    rating,
    inStock,
    featured,
  } = params;

  try {
    const response = await productApi.getProducts({
      category,
      sort: mapSortToBackendSort(sort),
      minPrice,
      maxPrice,
      search: searchQuery,
      page,
      limit: pageSize,
      rating,
      inStock,
      featured,
    });

    const products: Product[] = response.data.map((product: ApiProduct) => ({
      id: product._id,
      slug: product.slug || product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      discountPercentage: product.discountPrice
        ? Math.round(
            ((product.price - product.discountPrice) / product.price) * 100,
          )
        : 0,
      images: product.images.map((img: ApiImage) => img.url),
      category: product.category?.name || "Uncategorized",
      brand: product.brand || "Unknown",
      rating: product.averageRating || 0,
      reviewCount: product.ratingsCount || 0,
      stock: product.stock,
      isNew: isProductNew(product.createdAt),
      features: product.specifications
        ? Object.keys(product.specifications)
        : [],
      specifications: product.specifications || {},
    }));

    // Extract unique categories and brands
    const categories = [
      ...new Set(
        response.data
          .map((p: ApiProduct) => p.category?.name)
          .filter((name: string | undefined): name is string => Boolean(name)),
      ),
    ];

    const brands = [
      ...new Set(
        response.data
          .map((p: ApiProduct) => p.brand)
          .filter((brand): brand is string => Boolean(brand)),
      ),
    ];

    return {
      products,
      totalCount: response.total,
      categories: categories as string[],
      brands: brands as string[],
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

// Helper function to map frontend sort to backend sort
function mapSortToBackendSort(sort: string): string {
  const sortMap: Record<string, string> = {
    newest: "-createdAt",
    "price-low": "price",
    "price-high": "-price",
    "name-asc": "name",
    "name-desc": "-name",
    rating: "-averageRating",
  };

  return sortMap[sort] || "-createdAt";
}

// Helper function to determine if product is new (within last 30 days)
function isProductNew(createdAt: string): boolean {
  const createdDate = new Date(createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return createdDate > thirtyDaysAgo;
}
