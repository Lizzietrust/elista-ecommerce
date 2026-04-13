import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF8F5] to-[#F4EFEA] dark:from-[#2C2C2C] dark:to-[#1A1A1A]">
      <div className="container mx-auto px-4 py-8">
        {/* Header with logo */}
        <header className="mb-8 md:mb-12">
          <Link href="/" className="inline-block">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#2C3E3E] flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-2xl font-bold text-[#2C2C2C] dark:text-white">
                Elista<span className="text-[#C17B4D]">.</span>
              </span>
            </div>
          </Link>
        </header>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-200px)] gap-12">
          {/* Left side - Branding/Info */}
          <div className="lg:w-1/2 max-w-lg">
            <div className="hidden lg:block">
              <h1 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] dark:text-white mb-6">
                Welcome to <span className="text-[#C17B4D]">Elista</span>
              </h1>
              <p className="text-xl text-[#6B6B6B] dark:text-gray-400 mb-8">
                Your modern shopping destination. Sign in to access exclusive
                deals, track orders, and manage your wishlist.
              </p>

              {/* Feature cards with earthy theme */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-[#E8E0D8] hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#2C3E3E]/10 dark:bg-[#2C3E3E]/30 flex items-center justify-center">
                      <span className="text-[#2C3E3E] dark:text-[#4A6B6B] text-2xl">
                        🚀
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2C2C2C] dark:text-white">
                        Fast Checkout
                      </h3>
                      <p className="text-[#6B6B6B] dark:text-gray-400 text-sm">
                        Complete purchases in seconds
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-[#E8E0D8] hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#C17B4D]/10 dark:bg-[#C17B4D]/30 flex items-center justify-center">
                      <span className="text-[#C17B4D] text-2xl">🔒</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2C2C2C] dark:text-white">
                        Secure & Private
                      </h3>
                      <p className="text-[#6B6B6B] dark:text-gray-400 text-sm">
                        Your data is always protected
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-[#E8E0D8] hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#6B8E6B]/10 dark:bg-[#6B8E6B]/30 flex items-center justify-center">
                      <span className="text-[#6B8E6B] text-2xl">✨</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2C2C2C] dark:text-white">
                        Exclusive Deals
                      </h3>
                      <p className="text-[#6B6B6B] dark:text-gray-400 text-sm">
                        Member-only discounts and offers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Form */}
          <div className="lg:w-1/2 max-w-md w-full">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 md:p-10 border border-[#E8E0D8]">
              {children}
            </div>

            {/* Mobile only info */}
            <div className="mt-8 lg:hidden text-center">
              <p className="text-[#6B6B6B] dark:text-gray-400">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-[#C17B4D] dark:text-[#D49A6A] font-semibold hover:underline"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
