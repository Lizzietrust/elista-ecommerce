import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const resetCart = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email: "daniel.carter07@yopmail.com" });

    if (user) {
      user.cart.items = [];
      user.cart.coupon = null;
      user.cart.updatedAt = new Date();

      await user.save();
      console.log("✅ Cart cleared successfully");

      const products = [
        {
          id: "69e604e6dc264cc77f5d1c75",
          name: "Mid-Century Modern Coffee Table",
          price: 349.99,
        },
        {
          id: "69e604e6dc264cc77f5d1c71",
          name: "Modern Velvet Sofa",
          price: 899.99,
        },
        {
          id: "69e604e6dc264cc77f5d1c7d",
          name: "Upholstered Platform Bed",
          price: 599.99,
        },
        {
          id: "69e604e6dc264cc77f5d1ca5",
          name: "Storage Ottoman",
          price: 129.99,
        },
      ];

      for (const p of products) {
        user.cart.items.push({
          _id: new mongoose.Types.ObjectId(),
          product: p.id,
          quantity: 1,
          addedAt: Date.now(),
          priceAtAdd: p.price,
        });
      }

      user.cart.updatedAt = new Date();
      await user.save();

      console.log(`✅ Added ${products.length} items to cart with proper IDs`);
      console.log(
        "New cart items:",
        user.cart.items.map((item) => ({
          _id: item._id.toString(),
          productId: item.product,
          quantity: item.quantity,
        })),
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("Error resetting cart:", error);
    process.exit(1);
  }
};

resetCart();
