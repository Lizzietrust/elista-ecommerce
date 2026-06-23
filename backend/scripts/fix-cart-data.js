import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config();

const fixCartData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const users = await User.find({
      "cart.items.0": { $exists: true },
    });

    console.log(`Found ${users.length} users with cart items`);

    let fixedCount = 0;

    for (const user of users) {
      let modified = false;

      for (const item of user.cart.items) {
        if (typeof item.product === "string") {
          const product = await Product.findById(item.product);
          if (!product) {
            console.log(
              `Product ${item.product} not found, removing from cart`,
            );
            user.cart.items = user.cart.items.filter(
              (i) => i.product.toString() !== item.product.toString(),
            );
            modified = true;
          } else {
            if (!item.priceAtAdd) {
              item.priceAtAdd = product.price;
              modified = true;
            }
          }
        }
      }

      if (modified) {
        await user.save();
        fixedCount++;
        console.log(`Fixed cart for user: ${user.email}`);
      }
    }

    console.log(`✅ Fixed ${fixedCount} user carts`);
    process.exit(0);
  } catch (error) {
    console.error("Error fixing cart data:", error);
    process.exit(1);
  }
};

fixCartData();
