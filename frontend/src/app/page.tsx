import HeroSection from "@/components/sections/hero-section";
import FeaturedProducts from "@/components/sections/featured-products";
import CategoryGrid from "@/components/sections/category-grid";
import Newsletter from "@/components/sections/newsletter";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      <HeroSection />
      <FeaturedProducts />
      <CategoryGrid />
      <Newsletter />
    </div>
  );
}
