"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, Menu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/lib/hooks/use-cart";
import { useWishlist } from "@/lib/hooks/use-wishlist";
import { useCartContext } from "../providers/cart-provider";

export default function Header() {
  const cart = useCartContext();
  const wishlist = useWishlist();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between md:px-8 px-4 mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold text-foreground">
              Elista<span className="text-accent">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-200"
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-200"
            >
              Categories
            </Link>
            <Link
              href="/deals"
              className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-200"
            >
              Deals
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-200"
            >
              About
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="w-75 pl-10 border-border focus:ring-ring focus:ring-2"
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-accent hover:bg-muted"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            className="relative p-2 rounded-lg text-muted-foreground hover:text-accent hover:bg-muted transition-colors duration-200"
          >
            <Heart size={20} />
            {wishlist.itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {wishlist.itemCount}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            href="/cart"
            className="relative p-2 rounded-lg text-muted-foreground hover:text-accent hover:bg-muted transition-colors duration-200"
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.itemCount}
              </span>
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-accent hover:bg-muted"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem asChild>
                <Link
                  href="/account"
                  className="text-foreground hover:text-accent"
                >
                  My Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/orders"
                  className="text-foreground hover:text-accent"
                >
                  My Orders
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/wishlist"
                  className="text-foreground hover:text-accent"
                >
                  Wishlist
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="text-destructive hover:text-destructive">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-accent hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
