"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Package,
  Settings,
  Bell,
  CreditCard,
  LogOut,
  ChevronRight,
  Home,
  Heart,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

const navigation = [
  { name: "Account", href: "/dashboard/account", icon: User },
  { name: "Orders", href: "/dashboard/orders", icon: Package },
  { name: "Wishlist", href: "/wishlist", icon: Heart },
  { name: "Cart", href: "/cart", icon: ShoppingBag },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Payment Methods", href: "/dashboard/payments", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface DashboardUser {
  name: string;
  email: string;
  avatar: string;
  memberSince: string;
  totalOrders: number;
  totalSpent: number;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[#C17B4D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B6B6B] dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const authUser = user || {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    role: "user",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  const dashboardUserData: DashboardUser = {
    name: authUser.name,
    email: authUser.email,
    avatar:
      authUser.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    memberSince: authUser.createdAt
      ? new Date(authUser.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "Jan 2024",
    totalOrders: 12,
    totalSpent: 1245.89,
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] dark:bg-[#2C2C2C]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60 dark:bg-gray-900/95 dark:border-[#E8E0D8]/20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold text-[#2C2C2C] dark:text-white"
            >
              Elista<span className="text-[#C17B4D]">.</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-[#6B6B6B] dark:text-gray-400 hover:text-[#C17B4D] transition-colors"
              >
                <Home size={16} />
                <span className="hidden sm:inline">Back to Store</span>
              </Link>
              <div className="flex items-center gap-3">
                <img
                  src={dashboardUserData.avatar}
                  alt={dashboardUserData.name}
                  className="h-8 w-8 rounded-full border border-[#E8E0D8]"
                />
                <span className="hidden md:inline text-sm font-medium text-[#2C2C2C] dark:text-gray-300">
                  {dashboardUserData.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sticky top-24 border border-[#E8E0D8] dark:border-gray-800">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#E8E0D8] dark:border-gray-800">
                <img
                  src={dashboardUserData.avatar}
                  alt={dashboardUserData.name}
                  className="h-12 w-12 rounded-full border-2 border-white dark:border-gray-800"
                />
                <div>
                  <h3 className="font-bold text-[#2C2C2C] dark:text-white">
                    {dashboardUserData.name}
                  </h3>
                  <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                    {dashboardUserData.email}
                  </p>
                  <span className="inline-block mt-1 px-2 py-1 bg-[#2C3E3E]/10 dark:bg-[#2C3E3E]/30 text-[#2C3E3E] dark:text-[#4A6B6B] text-xs font-medium rounded-full">
                    Premium Member
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-[#6B6B6B] dark:text-gray-300 hover:bg-[#F4EFEA] dark:hover:bg-gray-800 hover:text-[#C17B4D] dark:hover:text-[#D49A6A] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <ChevronRight
                        size={16}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Link>
                  );
                })}
              </nav>

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-[#E8E0D8] dark:border-gray-800">
                <h4 className="font-bold text-[#2C2C2C] dark:text-white mb-4">
                  Quick Stats
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#6B6B6B] dark:text-gray-400">
                      Member since
                    </span>
                    <span className="text-sm font-medium text-[#2C2C2C] dark:text-white">
                      {dashboardUserData.memberSince}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#6B6B6B] dark:text-gray-400">
                      Total orders
                    </span>
                    <span className="text-sm font-medium text-[#2C2C2C] dark:text-white">
                      {dashboardUserData.totalOrders}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#6B6B6B] dark:text-gray-400">
                      Total spent
                    </span>
                    <span className="text-sm font-medium text-[#2C2C2C] dark:text-white">
                      ${dashboardUserData.totalSpent.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#6B6B6B] dark:text-gray-400">
                      Saved items
                    </span>
                    <span className="text-sm font-medium text-[#2C2C2C] dark:text-white">
                      8
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <div className="mt-8 pt-6 border-t border-[#E8E0D8] dark:border-gray-800">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[#C17B7B] hover:bg-[#C17B7B]/10 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Log out</span>
                </button>
              </div>
            </div>

            {/* Support Card */}
            <div className="mt-6 bg-linear-to-r from-[#F4EFEA] to-[#E8E0D8] dark:from-[#2C3E3E]/20 dark:to-[#C17B4D]/20 rounded-2xl p-6 border border-[#E8E0D8] dark:border-gray-800">
              <h4 className="font-bold text-[#2C2C2C] dark:text-white mb-3">
                Need Help?
              </h4>
              <p className="text-sm text-[#6B6B6B] dark:text-gray-400 mb-4">
                Our support team is here to help you.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm text-[#C17B4D] hover:text-[#D49A6A] transition-colors"
              >
                Contact Support →
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 border border-[#E8E0D8] dark:border-gray-800">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
