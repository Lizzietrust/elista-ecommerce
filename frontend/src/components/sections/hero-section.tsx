export default function HeroSection() {
  return (
    <section className="relative bg-linear-to-r from-blue-600 to-purple-700 text-white py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Discover Amazing Products
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Shop the latest trends with exclusive deals. Free shipping on orders
            over $50.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-white text-blue-700 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-300 shadow-lg">
              Shop Now
            </button>
            <button className="bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition duration-300">
              View Collections
            </button>
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
    </section>
  );
}
