"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface CartItemProps {
  item: {
    id: string;
    product: {
      _id: string;
      name: string;
      slug: string;
      price: number;
      comparePrice?: number;
      images: Array<{
        url: string;
        alt: string;
      }>;
      stock: number;
      category: string;
    };
    quantity: number;
    color?: string;
    size?: string;
    price: number;
  };
  onUpdateQuantity: (
    productId: string,
    newQuantity: number,
    color?: string,
    size?: string,
  ) => void;
  onRemove: (productId: string, color?: string, size?: string) => void;
  isLoading?: boolean;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  isLoading = false,
}: CartItemProps) {
  const handleIncrement = () => {
    if (item.quantity >= item.product.stock) {
      toast.error(`Only ${item.product.stock} items available in stock`);
      return;
    }
    onUpdateQuantity(
      item.product._id,
      item.quantity + 1,
      item.color,
      item.size,
    );
  };

  const handleDecrement = () => {
    if (item.quantity <= 1) return;
    onUpdateQuantity(
      item.product._id,
      item.quantity - 1,
      item.color,
      item.size,
    );
  };

  const handleRemove = () => {
    onRemove(item.product._id, item.color, item.size);
    toast.success("Item removed from cart");
  };

  const itemTotal = item.price * item.quantity;
  const isLowStock = item.product.stock <= 5;
  const isOutOfStock = item.product.stock === 0;

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-6 bg-white dark:bg-gray-900 rounded-xl border border-[#E8E0D8] dark:border-gray-800 hover:shadow-md transition-all duration-300">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <Link href={`/products/${item.product.slug}`}>
          <div className="h-24 w-24 md:h-28 md:w-28 bg-[#F4EFEA] dark:bg-gray-800 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300">
            {item.product.images && item.product.images[0] ? (
              <Image
                src={item.product.images[0].url}
                alt={item.product.images[0].alt || item.product.name}
                width={112}
                height={112}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl">🛒</span>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            {/* Category Link */}
            <Link
              href={`/categories/${item.product.category.toLowerCase()}`}
              className="text-xs text-[#C17B4D] hover:text-[#D49A6A] transition-colors uppercase tracking-wide font-medium"
            >
              {item.product.category}
            </Link>

            {/* Product Name */}
            <h3 className="font-bold text-[#2C2C2C] dark:text-white mt-1 hover:text-[#C17B4D] transition-colors">
              <Link href={`/products/${item.product.slug}`}>
                {item.product.name}
              </Link>
            </h3>

            {/* Variants */}
            <div className="flex flex-wrap gap-3 mt-2">
              {item.color && (
                <div className="text-sm">
                  <span className="text-[#6B6B6B] dark:text-gray-400">
                    Color:{" "}
                  </span>
                  <span className="font-medium text-[#2C2C2C] dark:text-white">
                    {item.color}
                  </span>
                </div>
              )}
              {item.size && (
                <div className="text-sm">
                  <span className="text-[#6B6B6B] dark:text-gray-400">
                    Size:{" "}
                  </span>
                  <span className="font-medium text-[#2C2C2C] dark:text-white">
                    {item.size}
                  </span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            {isOutOfStock ? (
              <div className="mt-2">
                <span className="text-xs text-[#C17B7B] font-medium bg-[#C17B7B]/10 px-2 py-1 rounded-full">
                  Out of Stock
                </span>
              </div>
            ) : (
              isLowStock && (
                <div className="mt-2">
                  <span className="text-xs text-[#C17B4D] font-medium bg-[#C17B4D]/10 px-2 py-1 rounded-full">
                    Only {item.product.stock} left in stock
                  </span>
                </div>
              )
            )}
          </div>

          {/* Price (Mobile) */}
          <div className="md:hidden flex items-center justify-between">
            <div className="text-lg font-bold text-[#2C2C2C] dark:text-white">
              ${item.price.toFixed(2)}
            </div>
            <div className="text-lg font-bold text-[#C17B4D]">
              ${itemTotal.toFixed(2)}
            </div>
          </div>

          {/* Price (Desktop) */}
          <div className="hidden md:block md:w-32 text-center">
            <div className="text-lg font-bold text-[#2C2C2C] dark:text-white">
              ${item.price.toFixed(2)}
            </div>
            {item.product.comparePrice && (
              <div className="text-sm line-through text-[#6B6B6B] dark:text-gray-500">
                ${item.product.comparePrice.toFixed(2)}
              </div>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="md:w-40">
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecrement}
                disabled={item.quantity <= 1 || isLoading || isOutOfStock}
                className="h-10 w-10 rounded-lg border border-[#E8E0D8] dark:border-gray-700 flex items-center justify-center text-[#2C2C2C] dark:text-gray-300 hover:bg-[#F4EFEA] dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Minus size={16} />
              </button>

              <div className="flex-1 text-center">
                <span className="text-lg font-bold text-[#2C2C2C] dark:text-white">
                  {item.quantity}
                </span>
              </div>

              <button
                onClick={handleIncrement}
                disabled={
                  item.quantity >= item.product.stock ||
                  isLoading ||
                  isOutOfStock
                }
                className="h-10 w-10 rounded-lg border border-[#E8E0D8] dark:border-gray-700 flex items-center justify-center text-[#2C2C2C] dark:text-gray-300 hover:bg-[#F4EFEA] dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Total & Remove (Desktop) */}
          <div className="hidden md:flex md:w-32 items-center justify-between">
            <div className="text-lg font-bold text-[#C17B4D]">
              ${itemTotal.toFixed(2)}
            </div>
            <button
              onClick={handleRemove}
              disabled={isLoading}
              className="text-gray-400 hover:text-[#C17B7B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Remove Button (Mobile) */}
          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-[#C17B7B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
