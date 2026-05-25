"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  Heart,
  X,
  Loader2,
} from "lucide-react";
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
import { useState, useEffect, useRef } from "react";
import { useSearchProducts } from "@/lib/hooks/use-products";

const navItems = [
  { name: "Home", path: "/", exact: true },
  { name: "Products", path: "/products", exact: false },
  { name: "Categories", path: "/categories", exact: false },
  { name: "Deals", path: "/deals", exact: false },
  { name: "About", path: "/about", exact: false },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const cart = useCartContext();
  const { data: wishlistData } = useWishlist();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const wishlistCount = wishlistData?.wishlist?.itemCount || 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: suggestions, isLoading: suggestionsLoading } =
    useSearchProducts(debouncedQuery, 5, {
      enabled: debouncedQuery.length > 2,
    });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productName: string) => {
    setSearchQuery(productName);
    router.push(`/search?q=${encodeURIComponent(productName)}`);
    setShowSuggestions(false);
  };

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return pathname === path;
    }
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur md:bg-background/60">
      <div className="container flex h-16 items-center justify-between md:px-8 px-4 mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold text-foreground">
              Elista<span className="text-accent">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(item.path, item.exact)
                    ? "text-accent font-semibold"
                    : "text-muted-foreground hover:text-accent"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Search with Autocomplete */}
          <div className="hidden md:flex items-center relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() =>
                  searchQuery.length > 0 && setShowSuggestions(true)
                }
                placeholder="Search products..."
                className="w-80 pl-10 pr-10 border-border focus:ring-ring focus:ring-2"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchQuery.length > 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
                {suggestionsLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Loader2 size={20} className="animate-spin mx-auto" />
                  </div>
                ) : suggestions && suggestions.length > 0 ? (
                  <div>
                    <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
                      Products
                    </div>
                    {suggestions.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleSuggestionClick(product.name)}
                        className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                      >
                        {product.images?.[0] && (
                          <img
                            src={
                              typeof product.images[0] === "string"
                                ? product.images[0]
                                : product.images[0].url
                            }
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {product.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${product.price.toFixed(2)}
                          </div>
                        </div>
                      </button>
                    ))}
                    <div className="border-t border-border p-2">
                      <button
                        onClick={handleSearch}
                        className="w-full text-center text-sm text-accent hover:underline"
                      >
                        View all results for "{searchQuery}" →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No products found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Search - Opens modal or expands */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-accent hover:bg-muted"
            onClick={() =>
              router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
            }
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            className={`relative p-2 rounded-lg transition-colors duration-200 ${
              isActive("/wishlist")
                ? "text-accent bg-muted"
                : "text-muted-foreground hover:text-accent hover:bg-muted"
            }`}
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            href="/cart"
            className={`relative p-2 rounded-lg transition-colors duration-200 ${
              isActive("/cart")
                ? "text-accent bg-muted"
                : "text-muted-foreground hover:text-accent hover:bg-muted"
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.itemCount}
              </span>
            )}
          </Link>

          {/* User Dropdown - existing code */}
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
                  className={`w-full ${
                    isActive("/account")
                      ? "text-accent font-semibold"
                      : "text-foreground hover:text-accent"
                  }`}
                >
                  My Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/orders"
                  className={`w-full ${
                    isActive("/orders")
                      ? "text-accent font-semibold"
                      : "text-foreground hover:text-accent"
                  }`}
                >
                  My Orders
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/wishlist"
                  className={`w-full ${
                    isActive("/wishlist")
                      ? "text-accent font-semibold"
                      : "text-foreground hover:text-accent"
                  }`}
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
