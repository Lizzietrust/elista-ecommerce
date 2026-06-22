import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import dynamic from "next/dynamic";
import LayoutWrapper from "@/components/layout/layout-wrapper";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              {/* Remove CartProvider - we're using TanStack Query directly */}
              <LayoutWrapper>{children}</LayoutWrapper>
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
