import { Star, ShoppingBag } from 'lucide-react';

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 129.99,
    originalPrice: 199.99,
    rating: 4.5,
    imageColor: "bg-gray-200",
  },
  {
    id: 2,
    name: "Organic Cotton T-Shirt",
    category: "Fashion",
    price: 24.99,
    originalPrice: 34.99,
    rating: 4.2,
    imageColor: "bg-blue-100",
  },
  {
    id: 3,
    name: "Ceramic Coffee Mug",
    category: "Home",
    price: 18.99,
    rating: 4.8,
    imageColor: "bg-amber-50",
  },
  {
    id: 4,
    name: "Fitness Tracker",
    category: "Electronics",
    price: 89.99,
    originalPrice: 129.99,
    rating: 4.3,
    imageColor: "bg-green-100",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Handpicked items just for you</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Product Image Placeholder */}
              <div className={`h-48 ${product.imageColor} flex items-center justify-center`}>
                <div className="text-4xl">🛒</div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm line-through text-gray-400">${product.originalPrice}</span>
                  )}
                </div>
                
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                
                <div className="flex items-center mb-4">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">{product.rating}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                  <button className="bg-gray-900 text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <ShoppingBag size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="text-blue-600 font-semibold border-2 border-blue-600 py-3 px-8 rounded-lg hover:bg-blue-50 transition duration-300">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}