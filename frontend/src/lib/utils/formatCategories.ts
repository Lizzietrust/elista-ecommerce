import { Category } from "@/lib/api/categories";

const GRADIENTS = [
  "from-[#2C3E3E] to-[#4A6B6B]",
  "from-[#C17B4D] to-[#D49A6A]",
  "from-[#6B8E6B] to-[#8BAA8B]",
  "from-[#D4C4B7] to-[#E8DED5]",
  "from-[#C17B7B] to-[#D49A9A]",
  "from-[#8B6B4D] to-[#A88B6D]",
];

const ICON_MAP: Record<string, string> = {
  Electronics: "⚡",
  "Home & Garden": "🏡",
  "Home Office": "💼",
  Lighting: "💡",
  "Storage & Organization": "📦",
  "Decor & Accessories": "🎨",
  "Living Room": "🛋️",
  Bedroom: "🛏️",
  "Kitchen & Dining": "🍽️",
  Fashion: "👕",
  "Sports & Outdoors": "⚽",
  Beauty: "💄",
  Books: "📚",
  Toys: "🎮",
  Food: "🍎",
};

export interface FormattedCategory {
  _id: string;
  name: string;
  slug: string;
  count: number;
  gradient: string;
  icon: string;
  image: string | null;
  description: string;
}

export function formatCategory(
  category: Category,
  index: number,
): FormattedCategory {
  let imageUrl = null;
  if (category.image) {
    if (typeof category.image === "string") {
      imageUrl = category.image;
    } else if (category.image.url) {
      imageUrl = category.image.url;
    }
  }

  return {
    _id: category._id,
    name: category.name,
    slug: category.slug,
    count: category.productCount || 0,
    gradient: GRADIENTS[index % GRADIENTS.length],
    icon: ICON_MAP[category.name] || "🛍️",
    image: imageUrl,
    description: category.description,
  };
}

export function formatCategories(categories: Category[]): FormattedCategory[] {
  return categories.map((category, index) => formatCategory(category, index));
}
