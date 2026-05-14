"use client";

import {
  Home,
  Sparkles,
  Shield,
  Truck,
  Award,
  Clock,
  Quote,
  Leaf,
  Users,
  Star,
  Heart,
  Paintbrush,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-linear-to-r from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20 py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Home className="text-amber-600" size={18} />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Welcome to Elista
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transforming Houses Into
            <span className="text-amber-600 dark:text-amber-400"> Homes</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Curated interior essentials that bring warmth, style, and
            personality to every room
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
              Our Story
            </h2>
            <div className="prose prose-lg dark:prose-invert mx-auto text-center">
              <p className="text-muted-foreground leading-relaxed mb-6">
                Founded in 2024,{" "}
                <span className="font-semibold text-foreground">Elista</span>{" "}
                was born from a simple belief: your home should tell your story.
                What started as a small curated collection of artisanal homeware
                has grown into a premier destination for interior enthusiasts
                seeking quality, style, and value.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We handpick every piece—from minimalist furniture to statement
                decor—ensuring each item meets our standards for craftsmanship,
                sustainability, and timeless design. Whether you're furnishing
                your first apartment or refreshing a family home, Elista is here
                to inspire and equip your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                <Sparkles className="text-amber-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
              <p className="text-muted-foreground">
                To democratize great design by making beautiful, high-quality
                interior products accessible to everyone—without compromising on
                ethics or aesthetics.
              </p>
            </div>
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                <Heart className="text-amber-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Our Vision</h3>
              <p className="text-muted-foreground">
                To become the most trusted destination for interior essentials,
                inspiring millions to create homes they truly love.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose Elista?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Paintbrush className="text-amber-600" size={28} />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Curated Collections
              </h3>
              <p className="text-sm text-muted-foreground">
                Every piece selected by interior design experts
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="text-amber-600" size={28} />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Sustainable Sourcing
              </h3>
              <p className="text-sm text-muted-foreground">
                Eco-friendly materials and ethical production
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-amber-600" size={28} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-sm text-muted-foreground">
                1-year warranty on all furniture pieces
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border border-border">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-amber-600" size={28} />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                White Glove Delivery
              </h3>
              <p className="text-sm text-muted-foreground">
                Free assembly and packaging removal on orders $500+
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-linear-to-r from-amber-100/50 to-rose-100/50 dark:from-amber-900/20 dark:to-rose-900/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                10k+
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Happy Homes
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                500+
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Curated Products
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                50+
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Trusted Brands
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                4.9
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Customer Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            What Our Customers Say
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of happy homeowners who've transformed their spaces
            with Elista
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6"
              >
                <Quote className="text-amber-400 mb-4" size={28} />
                <p className="text-muted-foreground mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.title}
                    </div>
                  </div>
                </div>
                <div className="flex mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Commitment */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full mb-6">
            <Leaf size={16} />
            <span className="text-sm font-medium">Our Commitment</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Sustainable at Every Step</h2>
          <p className="text-muted-foreground mb-8">
            We partner with artisans and brands who share our values—fair wages,
            sustainable materials, and minimal environmental impact. From
            packaging to delivery, we're committed to protecting our planet.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-3 py-1 bg-muted rounded-full text-sm">
              🌱 Eco-friendly materials
            </span>
            <span className="px-3 py-1 bg-muted rounded-full text-sm">
              📦 Plastic-free packaging
            </span>
            <span className="px-3 py-1 bg-muted rounded-full text-sm">
              🏭 Carbon-neutral shipping
            </span>
            <span className="px-3 py-1 bg-muted rounded-full text-sm">
              🤝 Fair trade certified
            </span>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto bg-linear-to-r from-amber-50 to-rose-50 dark:from-amber-950/30 dark:to-rose-950/30 rounded-2xl p-8 md:p-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-black rounded-full shadow-lg mb-6 mx-auto">
              <Award className="text-amber-600" size={32} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Love It or Return It
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              30-day easy returns • Free pickup • Full refund
            </p>
            <Link
              href="/deals"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
            >
              Shop Our Collections
              <Home size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const testimonials = [
  {
    quote:
      "Elista completely transformed my living room. The quality is outstanding and the prices were surprisingly affordable.",
    name: "Sarah Chen",
    title: "Interior Designer",
  },
  {
    quote:
      "Finally found a place that understands my aesthetic. The curation is impeccable and delivery was seamless.",
    name: "Marcus Wright",
    title: "Homeowner",
  },
  {
    quote:
      "Their customer service went above and beyond. Highly recommend for anyone furnishing their first home.",
    name: "Emma Rodriguez",
    title: "First-time Homeowner",
  },
];
