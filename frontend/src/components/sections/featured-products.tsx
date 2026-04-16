import { Star, ShoppingBag } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 129.99,
    originalPrice: 199.99,
    rating: 4.5,
    imageGradient: "from-[#D4C4B7]/30 to-[#C17B4D]/20",
  },
  {
    id: 2,
    name: "Organic Cotton T-Shirt",
    category: "Fashion",
    price: 24.99,
    originalPrice: 34.99,
    rating: 4.2,
    imageGradient: "from-[#C17B4D]/20 to-[#D49A6A]/10",
  },
  {
    id: 3,
    name: "Ceramic Coffee Mug",
    category: "Home",
    price: 18.99,
    rating: 4.8,
    imageGradient: "from-[#6B8E6B]/20 to-[#8BAA8B]/10",
  },
  {
    id: 4,
    name: "Fitness Tracker",
    category: "Electronics",
    price: 89.99,
    originalPrice: 129.99,
    rating: 4.3,
    imageGradient: "from-[#2C3E3E]/20 to-[#4A6B6B]/10",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="py-12 md:py-16 bg-muted">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Featured Products
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Handpicked items just for you
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-card rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border"
            >
              {/* Product Image Placeholder with Gradient */}
              <div
                className={`h-48 bg-linear-to-br ${product.imageGradient} flex items-center justify-center relative overflow-hidden`}
              >
                <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                  🛒
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm line-through text-muted-foreground">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-accent transition-colors duration-300">
                  {product.name}
                </h3>

                <div className="flex items-center mb-4">
                  <div className="flex text-accent">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={
                          i < Math.floor(product.rating)
                            ? "currentColor"
                            : "none"
                        }
                        className={
                          i < Math.floor(product.rating)
                            ? "text-accent"
                            : "text-muted-foreground"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">
                    {product.rating}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <div className="text-xs text-success mt-1">
                        Save $
                        {(product.originalPrice - product.price).toFixed(2)}
                      </div>
                    )}
                  </div>
                  <button className="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary-light transition-all duration-300 hover:scale-105">
                    <ShoppingBag size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="text-accent font-semibold border-2 border-accent py-3 px-8 rounded-lg hover:bg-accent/10 transition-all duration-300 hover:scale-105">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}
