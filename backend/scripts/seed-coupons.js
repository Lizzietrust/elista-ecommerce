import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";

dotenv.config();

const coupons = [
  {
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    maxDiscountAmount: 50,
    minPurchaseAmount: 0,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    usageLimit: 100,
    perUserLimit: 1,
    isActive: true,
    description: "10% off your first order",
    createdBy: null,
  },
  {
    code: "SAVE20",
    discountType: "percentage",
    discountValue: 20,
    maxDiscountAmount: 100,
    minPurchaseAmount: 100,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    usageLimit: 200,
    perUserLimit: 1,
    isActive: true,
    description: "20% off orders over $100",
    createdBy: null,
  },
  {
    code: "FREESHIP",
    discountType: "free_shipping",
    discountValue: 0,
    minPurchaseAmount: 50,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usageLimit: 500,
    perUserLimit: 3,
    isActive: true,
    description: "Free shipping on orders over $50",
    createdBy: null,
  },
  {
    code: "SUMMER25",
    discountType: "percentage",
    discountValue: 25,
    maxDiscountAmount: 150,
    minPurchaseAmount: 150,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    usageLimit: 150,
    perUserLimit: 1,
    isActive: true,
    description: "25% off summer collection orders over $150",
    createdBy: null,
  },
  {
    code: "FLASH15",
    discountType: "percentage",
    discountValue: 15,
    maxDiscountAmount: 75,
    minPurchaseAmount: 0,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    usageLimit: 50,
    perUserLimit: 1,
    isActive: true,
    description: "Flash sale - 15% off all orders",
    createdBy: null,
  },
  {
    code: "BULK10",
    discountType: "fixed",
    discountValue: 10,
    minPurchaseAmount: 200,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    usageLimit: 100,
    perUserLimit: 2,
    isActive: true,
    description: "$10 off orders over $200",
    createdBy: null,
  },
];

const seedCoupons = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    let admin = await User.findOne({ role: "admin" });

    if (!admin) {
      console.log("No admin found. Creating admin user...");

      admin = await User.findOne({ email: "admin@elista.com" });

      if (!admin) {
        const hashedPassword = await bcrypt.hash("Admin123!", 10);
        admin = await User.create({
          name: "Admin",
          email: "admin@elista.com",
          password: hashedPassword,
          phone: "1234567890",
          role: "admin",
          isEmailVerified: true,
          isActive: true,
        });
        console.log("✅ Created admin user for coupon seeding");
      } else {
        admin.role = "admin";
        await admin.save();
        console.log("✅ Updated existing user to admin role");
      }
    } else {
      console.log(`✅ Found admin user: ${admin.email}`);
    }

    await Coupon.deleteMany({});
    console.log("✅ Cleared existing coupons");

    const couponsWithCreator = coupons.map((coupon) => ({
      ...coupon,
      createdBy: admin._id,
    }));

    const insertedCoupons = await Coupon.insertMany(couponsWithCreator);
    console.log(`✅ Seeded ${insertedCoupons.length} coupons successfully`);

    console.log("\n📋 Seeded Coupons:");
    insertedCoupons.forEach((coupon) => {
      const discountDesc =
        coupon.discountType === "percentage"
          ? `${coupon.discountValue}% off`
          : coupon.discountType === "fixed"
            ? `$${coupon.discountValue} off`
            : "Free shipping";
      console.log(
        `  - ${coupon.code}: ${discountDesc}${coupon.minPurchaseAmount > 0 ? ` (Min. $${coupon.minPurchaseAmount})` : ""}`,
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding coupons:", error);
    process.exit(1);
  }
};

seedCoupons();
