const categories = [
  {
    name: "Electronics",
    count: 245,
    gradient: "from-[#2C3E3E] to-[#4A6B6B]",
    icon: "⚡",
  },
  {
    name: "Fashion",
    count: 189,
    gradient: "from-[#C17B4D] to-[#D49A6A]",
    icon: "👗",
  },
  {
    name: "Home & Garden",
    count: 156,
    gradient: "from-[#6B8E6B] to-[#8BAA8B]",
    icon: "🏡",
  },
  {
    name: "Sports",
    count: 98,
    gradient: "from-[#D4C4B7] to-[#E8DED5]",
    icon: "⚽",
  },
  {
    name: "Beauty",
    count: 132,
    gradient: "from-[#C17B7B] to-[#D49A9A]",
    icon: "💄",
  },
  {
    name: "Books",
    count: 76,
    gradient: "from-[#8B6B4D] to-[#A88B6D]",
    icon: "📚",
  },
];

export default function CategoryGrid() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Shop by Category
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
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
              {/* Category Card with Gradient Background */}
              <div
                className={`h-48 bg-gradient-to-br ${category.gradient} flex flex-col items-center justify-center text-white`}
              >
                <span className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </span>
                <h3 className="text-2xl font-bold">{category.name}</h3>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center text-white p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-xl font-semibold">
                    Explore {category.count} items
                  </p>
                  <p className="mt-2 text-lg font-medium">
                    Shop Now{" "}
                    <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </p>
                </div>
              </div>

              {/* Item Count Badge */}
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-foreground font-bold py-1 px-3 rounded-full text-sm shadow-sm">
                {category.count}+
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
