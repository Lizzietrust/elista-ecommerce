import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#FDF8F4" }}>
      {/* Left — Form Panel */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-10 sm:px-16 lg:px-20 xl:px-28 py-16 bg-white">
        {/* Logo */}
        <div className="mb-12">
          <Link href="/" className="inline-block">
            <span
              className="text-2xl font-semibold tracking-tight"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                color: "#1A1A1A",
              }}
            >
              elista
            </span>
          </Link>
        </div>

        {/* Form content */}
        <div>{children}</div>
      </div>

      {/* Right — Warm Image Panel */}
      <div
        className="hidden lg:block lg:w-[55%] relative overflow-hidden"
        style={{ backgroundColor: "#E8DDD4" }}
      >
        <img
          src="/images/auth-workspace.webp"
          alt="Warm workspace"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle warm overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(193,123,77,0.06)" }}
        />
        {/* Quote card */}
        <div className="absolute bottom-10 left-10 right-10">
          <div
            className="backdrop-blur-sm rounded-xl p-6"
            style={{ backgroundColor: "rgba(255,255,255,0.72)" }}
          >
            <p
              className="text-sm font-medium leading-relaxed"
              style={{
                fontFamily: "'Georgia', serif",
                color: "#1A1A1A",
              }}
            >
              "A thoughtfully curated shopping experience, built around you."
            </p>
            <p className="text-xs mt-2" style={{ color: "#7A6B5D" }}>
              — The Elista Promise
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
