// Helper function to calculate discount
export const calculateDiscount = (subtotal, coupon) => {
  let discount = 0;

  switch (coupon.discountType) {
    case "percentage":
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
      break;
    case "fixed":
      discount = coupon.discountValue;
      if (discount > subtotal) {
        discount = subtotal;
      }
      break;
    case "free_shipping":
      // This would be handled in shipping calculation
      discount = 0;
      break;
  }

  return discount;
};

// Helper function to calculate shipping
export const calculateShipping = (cartItems) => {
  // Implement your shipping calculation logic here
  // This could be based on weight, location, cart total, etc.

  // For now, return a simple flat rate
  const subtotal = cartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  // Free shipping over $50
  if (subtotal > 50) {
    return 0;
  }

  // Flat rate shipping
  return 5.99;
};

// Helper function to calculate tax
export const calculateTax = (amount) => {
  // Implement your tax calculation logic here
  // This could be based on location, product type, etc.

  // For now, return 8% tax
  return amount * 0.08;
};
