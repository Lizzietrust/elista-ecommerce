import { ReactNode } from "react";
import Link from "next/link";
import {
  User,
  Package,
  Settings,
  Bell,
  CreditCard,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { auth } from "@/lib/auth"; 

const navigation = [
  { name: "Account", href: "/dashboard/account", icon: User },
  { name: "Orders", href: "/dashboard/orders", icon: Package },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Payment Methods", href: "/dashboard/payments", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // In a real app, get the user from your auth system
  // const session = await auth();
  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:border-gray-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              Elista<span className="text-blue-600">.</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Back to Store
              </Link>
              {/* User avatar */}
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
                <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.name}
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
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sticky top-24">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b dark:border-gray-800">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </p>
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
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
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

              {/* Logout Button */}
              <div className="mt-8 pt-6 border-t dark:border-gray-800">
                <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <LogOut size={20} />
                  <span className="font-medium">Log out</span>
                </button>
              </div>

              {/* Stats */}
              <div className="mt-8 pt-6 border-t dark:border-gray-800">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Member since
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Jan 2024
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total orders
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      12
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total spent
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      $1,245.89
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
