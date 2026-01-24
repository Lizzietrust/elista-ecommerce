"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/hooks/use-cart";
import { Product } from "@/types";
import { toast } from "react-hot-toast";

interface AddToCartProps {
  product: Product;
}

export function AddToCart({ product }: AddToCartProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>();
  const [selectedSize, setSelectedSize] = useState<string>();

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error("This product is out of stock");
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }

    addItem({
      product,
      quantity,
      color: selectedColor,
      size: selectedSize,
      price: product.price,
    });

    toast.success(`${product.name} added to cart!`);
    setQuantity(1); // Reset quantity after adding
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Color Selection */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">
            Color
          </h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  selectedColor === color
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "border-gray-300 dark:border-gray-700 hover:border-blue-500"
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
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">Size</h3>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  selectedSize === size
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "border-gray-300 dark:border-gray-700 hover:border-blue-500"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center border rounded-xl overflow-hidden">
            <button
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="h-12 w-12 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus size={20} />
            </button>
            <div className="h-12 w-16 flex items-center justify-center font-bold text-gray-900 dark:text-white">
              {quantity}
            </div>
            <button
              onClick={incrementQuantity}
              disabled={quantity >= product.stock}
              className="h-12 w-12 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 py-3 text-lg gap-3"
          >
            <ShoppingCart size={20} />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>

        {/* Stock Warning */}
        {product.stock > 0 && product.stock < 10 && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <span className="font-medium">
                Only {product.stock} left in stock!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
