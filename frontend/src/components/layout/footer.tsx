import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Heart,
  Mail,
} from "lucide-react";

const footerLinks = {
  shop: [
    { name: "All Products", href: "/products" },
    { name: "New Arrivals", href: "/new-arrivals" },
    { name: "Best Sellers", href: "/best-sellers" },
    { name: "Sale", href: "/sale" },
    { name: "Gift Cards", href: "/gift-cards" },
  ],
  help: [
    { name: "Customer Service", href: "/help/customer-service" },
    { name: "Shipping Info", href: "/help/shipping" },
    { name: "Returns & Exchanges", href: "/help/returns" },
    { name: "Size Guide", href: "/help/size-guide" },
    { name: "FAQ", href: "/help/faq" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Sustainability", href: "/sustainability" },
    { name: "Press", href: "/press" },
    { name: "Store Locations", href: "/stores" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-background border-border">
      <div className="container mx-auto px-4 py-12 md:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="text-2xl font-bold text-foreground mb-4 inline-block hover:opacity-80 transition-opacity"
            >
              Elista<span className="text-accent">.</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
              Your destination for modern shopping. We bring you the latest
              trends with quality and style.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="bg-card p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-accent transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="font-bold text-foreground text-lg mb-4 relative inline-block">
              Shop
              <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-accent mt-1"></span>
            </h3>
            <ul className="space-y-3 mt-4">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-accent transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground text-lg mb-4 relative inline-block">
              Help
              <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-accent mt-1"></span>
            </h3>
            <ul className="space-y-3 mt-4">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-accent transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground text-lg mb-4 relative inline-block">
              Company
              <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-accent mt-1"></span>
            </h3>
            <ul className="space-y-3 mt-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-accent transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-warm rounded-2xl p-6 md:p-8 mb-10 border border-border shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                <Mail size={24} className="text-accent" />
                <h3 className="text-xl font-bold text-foreground">
                  Get the latest updates
                </h3>
              </div>
              <p className="text-muted-foreground">
                Subscribe to our newsletter for exclusive deals and new arrivals
              </p>
            </div>
            <form className="flex w-full md:w-auto gap-3 flex-col sm:flex-row">
              <input
                type="email"
                placeholder="Your email address"
                className="grow md:w-72 px-4 py-3 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-light text-primary-foreground font-semibold px-8 py-3 rounded-xl transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Elista Ecommerce. All rights reserved.
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              Cookie Policy
            </Link>
            <Link
              href="/sitemap"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              Sitemap
            </Link>
          </div>

          <div className="text-muted-foreground text-sm flex items-center gap-1">
            Made with{" "}
            <Heart size={14} className="text-destructive fill-current" /> by
            Elista Team
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs text-muted-foreground">
              Secure payment methods
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="h-8 w-12 bg-card rounded-lg flex items-center justify-center shadow-sm border border-border">
                <span className="font-bold text-xs text-foreground">VISA</span>
              </div>
              <div className="h-8 w-12 bg-card rounded-lg flex items-center justify-center shadow-sm border border-border">
                <span className="font-bold text-xs text-foreground">MC</span>
              </div>
              <div className="h-8 w-12 bg-card rounded-lg flex items-center justify-center shadow-sm border border-border">
                <span className="font-bold text-xs text-foreground">AMEX</span>
              </div>
              <div className="h-8 w-12 bg-card rounded-lg flex items-center justify-center shadow-sm border border-border">
                <span className="font-bold text-xs text-foreground">PP</span>
              </div>
              <div className="h-8 w-12 bg-card rounded-lg flex items-center justify-center shadow-sm border border-border">
                <span className="text-lg">🍎</span>
              </div>
              <div className="h-8 w-12 bg-card rounded-lg flex items-center justify-center shadow-sm border border-border">
                <span className="text-lg">📱</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-lg">🚚</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Free Shipping Over $50
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-accent text-lg">🔒</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Secure Checkout
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <span className="text-success text-lg">↩️</span>
            </div>
            <span className="text-xs text-muted-foreground">
              30-Day Returns
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <span className="text-accent text-lg">⭐</span>
            </div>
            <span className="text-xs text-muted-foreground">24/7 Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
