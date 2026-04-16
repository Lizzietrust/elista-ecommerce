export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary-light to-accent text-white py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="text-secondary-light text-sm font-medium">
              ✨ Limited Time Offer
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Discover{" "}
            <span className="text-secondary-light">Amazing Products</span>
          </h1>

          <p className="text-xl mb-8 text-secondary-light">
            Shop the latest trends with exclusive deals. Free shipping on orders
            over $50.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-white text-primary font-semibold py-3 px-8 rounded-lg hover:bg-muted transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 group">
              Shop Now
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </button>
            <button className="bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105">
              View Collections
            </button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary-light/30 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

      {/* Animated particles */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </section>
  );
}
