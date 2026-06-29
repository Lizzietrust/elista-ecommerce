import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const cleanupCart = async () => {
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
        if (!item._id) {
          item._id = new mongoose.Types.ObjectId();
          modified = true;
        }

        if (!item.addedAt) {
          item.addedAt = Date.now();
          modified = true;
        }

        if (!item.quantity || item.quantity < 1) {
          item.quantity = 1;
          modified = true;
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
    console.error("Error cleaning up cart data:", error);
    process.exit(1);
  }
};

cleanupCart();
