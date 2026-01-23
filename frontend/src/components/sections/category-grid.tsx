const categories = [
  { name: "Electronics", count: 245, color: "bg-blue-500", icon: "⚡" },
  { name: "Fashion", count: 189, color: "bg-pink-500", icon: "👗" },
  { name: "Home & Garden", count: 156, color: "bg-green-500", icon: "🏡" },
  { name: "Sports", count: 98, color: "bg-orange-500", icon: "⚽" },
  { name: "Beauty", count: 132, color: "bg-purple-500", icon: "💄" },
  { name: "Books", count: 76, color: "bg-amber-500", icon: "📚" },
];

export default function CategoryGrid() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find what you love in our curated collections
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <a
              key={index}
              href="#"
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div
                className={`h-48 ${category.color} flex flex-col items-center justify-center text-white`}
              >
                <span className="text-5xl mb-4">{category.icon}</span>
                <h3 className="text-2xl font-bold">{category.name}</h3>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <p className="text-xl font-semibold">
                    Explore {category.count} items
                  </p>
                  <p className="mt-2 text-lg">Shop Now →</p>
                </div>
              </div>

              {/* Item Count Badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 font-bold py-1 px-3 rounded-full">
                {category.count}+
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
