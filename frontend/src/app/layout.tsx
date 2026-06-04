import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { CartProvider } from "@/providers/cart-provider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CampaignBanner from "@/components/campaign/CampaignBanner";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Elista Ecommerce - Modern Online Shopping",
  description: "A modern ecommerce platform built with Next.js and TypeScript",
  keywords: [
    "ecommerce",
    "online shopping",
    "fashion",
    "electronics",
    "home decor",
  ],
  authors: [{ name: "Elista" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <CartProvider>
                <div className="flex min-h-screen flex-col bg-[#FDF8F5] dark:bg-[#2C2C2C]">
                  {!isAuthPage && <Header />}
                  <main className="flex-1">
                    {!isAuthPage && <CampaignBanner />}
                    {children}
                  </main>
                  {!isAuthPage && <Footer />}
                </div>
                <Toaster />
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
