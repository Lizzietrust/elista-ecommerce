import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function fixCartIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const users = await User.find({ "cart.items.0": { $exists: true } });

    for (const user of users) {
      let modified = false;

      user.cart.items = user.cart.items.map((item) => {
        if (!item._id) {
          modified = true;
          return {
            ...item.toObject(),
            _id: new mongoose.Types.ObjectId(),
          };
        }
        return item;
      });

      if (modified) {
        await user.save();
        console.log(`Fixed cart for user: ${user.email}`);
      }
    }

    console.log("Done fixing cart IDs!");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing cart IDs:", error);
    process.exit(1);
  }
}

fixCartIds();
