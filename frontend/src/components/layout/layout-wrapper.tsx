"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import Footer from "./footer";
import CampaignBanner from "../campaign/CampaignBanner";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthPage =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password");

  return (
    <div className="flex min-h-screen flex-col bg-[#FDF8F5] dark:bg-[#2C2C2C]">
      {!isAuthPage && <Header />}
      <main className="flex-1">
        {!isAuthPage && <CampaignBanner />}
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}
