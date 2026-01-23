import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header with logo */}
        <header className="mb-8 md:mb-12">
          <Link href="/" className="inline-block">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Elista<span className="text-blue-600">.</span>
              </span>
            </div>
          </Link>
        </header>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-200px)] gap-12">
          {/* Left side - Branding/Info */}
          <div className="lg:w-1/2 max-w-lg">
            <div className="hidden lg:block">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Welcome to <span className="text-blue-600">Elista</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Your modern shopping destination. Sign in to access exclusive
                deals, track orders, and manage your wishlist.
              </p>

              {/* Testimonial/Feature cards */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-2xl">
                        🚀
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Fast Checkout
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Complete purchases in seconds
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-2xl">
                        🔒
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Secure & Private
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Your data is always protected
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Form */}
          <div className="lg:w-1/2 max-w-md w-full">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 md:p-10">
              {children}
            </div>

            {/* Mobile only info */}
            <div className="mt-8 lg:hidden text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
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
