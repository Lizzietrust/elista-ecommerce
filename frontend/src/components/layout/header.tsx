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
  LogIn,
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
import { useWishlist } from "@/lib/hooks/use-wishlist";
import { useCartContext } from "../../providers/cart-provider";
import { useAuth } from "@/providers/auth-provider";
import { useState, useEffect, useRef } from "react";
import { useSearchProducts } from "@/lib/hooks/use-products";
import { LogoutButton } from "@/components/auth/logout-button";
import { WishlistResponse } from "@/types/auth";

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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const cart = useCartContext();
  const { data: wishlistData } = useWishlist();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const wishlistCount =
    (wishlistData as WishlistResponse)?.wishlist?.itemCount || 0;

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
        {/* Logo and Nav */}
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

        {/* Actions */}
        <div className="flex items-center gap-3">
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
            {showSuggestions && searchQuery.length > 1 && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-foreground/10"
                  onClick={() => setShowSuggestions(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-background border-2 border-border rounded-xl shadow-2xl overflow-hidden animate-slide-down">
                  {suggestionsLoading ? (
                    <div className="p-6 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2
                          size={20}
                          className="animate-spin text-accent"
                        />
                        <span className="text-sm">Searching products...</span>
                      </div>
                    </div>
                  ) : suggestions && suggestions.length > 0 ? (
                    <div>
                      <div className="px-4 py-3 bg-background-secondary border-b border-border">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Products
                        </span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {suggestions.map((product, index) => (
                          <button
                            key={product._id}
                            onClick={() => handleSuggestionClick(product.name)}
                            className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center gap-3 ${
                              index !== suggestions.length - 1
                                ? "border-b border-border"
                                : ""
                            } hover:bg-secondary-light/50 hover:translate-x-1`}
                          >
                            <div className="shrink-0 w-12 h-12 bg-background-secondary rounded-lg overflow-hidden border border-border">
                              {product.images?.[0] ? (
                                <img
                                  src={
                                    typeof product.images[0] === "string"
                                      ? product.images[0]
                                      : product.images[0].url
                                  }
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <Search size={20} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-foreground truncate">
                                {product.name}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-semibold text-accent">
                                  ${product.price.toFixed(2)}
                                </span>
                                {product.comparePrice &&
                                  product.comparePrice > product.price && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      ${product.comparePrice.toFixed(2)}
                                    </span>
                                  )}
                                {product.discountPercentage > 0 && (
                                  <span className="text-xs font-medium text-success bg-success/10 px-1.5 py-0.5 rounded">
                                    -{product.discountPercentage}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="shrink-0 text-muted-foreground group-hover:text-accent transition-colors">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="border-t-2 border-border bg-background-secondary">
                        <button
                          onClick={handleSearch}
                          className="w-full px-4 py-3 text-center text-sm font-medium text-accent hover:text-accent-dark transition-colors flex items-center justify-center gap-2 hover:bg-secondary-light/30"
                        >
                          <Search size={16} />
                          View all results for &quot;{searchQuery}&quot;
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-background-secondary rounded-full mb-3 border border-border">
                        <Search size={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        No products found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search or browse our categories
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Search */}
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

          {/* Authenticated User Icons */}
          {isAuthenticated ? (
            <>
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
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
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
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cart.itemCount > 99 ? "99+" : cart.itemCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-accent hover:bg-muted"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-card border-border w-56"
                >
                  {user && (
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  )}
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account"
                      className="w-full cursor-pointer text-foreground hover:text-accent"
                    >
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/orders"
                      className="w-full cursor-pointer text-foreground hover:text-accent"
                    >
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/wishlist"
                      className="w-full cursor-pointer text-foreground hover:text-accent"
                    >
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem>
                    <LogoutButton
                      variant="ghost"
                      size="default"
                      className="w-full justify-start px-2 py-1.5 text-sm font-normal text-destructive hover:text-destructive"
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            /* Unauthenticated - Login Button */
            <Button
              onClick={() => router.push("/login")}
              className="bg-accent hover:bg-accent-light text-accent-foreground flex items-center gap-2 transition-all"
              size="sm"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Login</span>
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-accent hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-sm font-medium transition-colors duration-200 ${
                  isActive(item.path, item.exact)
                    ? "text-accent font-semibold"
                    : "text-muted-foreground hover:text-accent"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-accent hover:text-accent-light transition-colors"
              >
                Login
              </Link>
            )}
            {isAuthenticated && (
              <>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-muted-foreground hover:text-accent transition-colors"
                >
                  My Account
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-muted-foreground hover:text-accent transition-colors"
                >
                  My Orders
                </Link>
                <LogoutButton
                  variant="ghost"
                  size="default"
                  className="block w-full text-left text-sm font-medium text-destructive hover:text-destructive-light transition-colors px-0 py-2"
                />
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
