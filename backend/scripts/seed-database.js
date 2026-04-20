// scripts/seed-database.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { interiorProducts } from "../data/interior-products.js";

dotenv.config();

const databaseURL = process.env.MONGODB_URI;

async function seedDatabase() {
  try {
    // ========== DEBUG: Find products with missing categories ==========
    console.log("🔍 Checking for products with missing categories...");
    interiorProducts.forEach((p, i) => {
      if (!p.category) {
        console.log(`   ⚠️  Index ${i}: "${p.name}" has no category`);
      }
    });

    console.log("📦 Starting database seeding...");
    console.log("Connecting to database...");

    await mongoose.connect(databaseURL, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
    });

    console.log("✅ Database connection successful");

    // ========== 1. CREATE OR GET DEFAULT SELLER ==========
    // Use the native MongoDB collection directly to bypass ALL Mongoose middleware
    console.log("\n👤 Setting up seller...");

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    let seller = await usersCollection.findOne({ email: "seller@elista.com" });

    if (!seller) {
      const hashedPassword = await bcrypt.hash("Admin@123", 10);

      const sellerData = {
        name: "Default Seller",
        email: "seller@elista.com",
        password: hashedPassword,
        phone: "1234567890",
        role: "admin",
        isActive: true,
        isEmailVerified: true,
        address: {
          street: "123 Main Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
        },
        addresses: [
          {
            _id: new mongoose.Types.ObjectId(),
            street: "123 Main Street",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA",
            isDefault: true,
            addressType: "home",
            phone: "1234567890",
            fullName: "Default Seller",
            createdAt: new Date(),
          },
        ],
        cart: {
          items: [],
          updatedAt: new Date(),
          discountAmount: 0,
          taxRate: 0.08,
          currency: "USD",
          requiresShipping: true,
        },
        preferences: {
          newsletter: true,
          marketingEmails: false,
          currency: "USD",
          language: "en",
          shippingPreference: "standard",
          taxExempt: false,
          defaultPaymentMethodType: "card",
          savePaymentMethods: true,
          autoSavePaymentMethods: false,
        },
        wishlist: [],
        recentlyViewed: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const insertResult = await usersCollection.insertOne(sellerData);
      seller = { _id: insertResult.insertedId, ...sellerData };

      console.log("   ✓ Created default seller");
      console.log(`   Seller ID: ${seller._id}`);
      console.log(`   Seller Email: ${seller.email}`);
    } else {
      console.log("   ✓ Found existing seller");
      console.log(`   Seller ID: ${seller._id}`);
      console.log(`   Seller Email: ${seller.email}`);
    }

    // ========== 2. CREATE OR GET CATEGORIES ==========
    console.log("\n📁 Setting up categories...");
    const categoryMap = new Map();

    // Filter out products with missing category or name and log them
    const validProducts = interiorProducts.filter((p, i) => {
      if (!p.category) {
        console.warn(
          `   ⚠️  Product at index ${i} has no category: "${p.name}" — skipping`,
        );
        return false;
      }
      if (!p.name) {
        console.warn(`   ⚠️  Product at index ${i} has no name — skipping`);
        return false;
      }
      return true;
    });

    console.log(
      `   Total products: ${interiorProducts.length}, Valid: ${validProducts.length}, Skipped: ${interiorProducts.length - validProducts.length}`,
    );

    const categories = [...new Set(validProducts.map((p) => p.category))];
    console.log(`   Found categories: ${categories.join(", ")}`);

    for (const categoryName of categories) {
      let category = await Category.findOne({ name: categoryName });
      if (!category) {
        category = await Category.create({
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: `${categoryName} products`,
          isActive: true,
        });
        console.log(`   ✓ Created category: ${categoryName}`);
      } else {
        console.log(`   ✓ Found category: ${categoryName}`);
      }
      categoryMap.set(categoryName, category._id);
    }

    // ========== 3. CLEAR EXISTING PRODUCTS ==========
    await Product.deleteMany({});
    console.log("\n✓ Cleared existing products");

    // ========== 4. PROCESS EACH PRODUCT ==========
    const productsToInsert = [];

    for (let i = 0; i < validProducts.length; i++) {
      const product = validProducts[i];
      console.log(
        `\n📦 [${i + 1}/${validProducts.length}] Processing: ${product.name}`,
      );

      const categoryId = categoryMap.get(product.category);
      if (!categoryId) {
        console.error(`   ❌ Category not found for: ${product.category}`);
        continue;
      }

      // Guard against missing images array
      const images = Array.isArray(product.images) ? product.images : [];
      const formattedImages = images.map((img, index) => ({
        url: img.url,
        publicId: null,
        thumbnail: img.url,
        isDefault: index === 0,
        altText: img.altText || `${product.name} - Image ${index + 1}`,
        order: index,
      }));

      const sku = `${product.name.substring(0, 3).toUpperCase()}-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;

      const productData = {
        name: product.name,
        slug: product.slug,
        description: product.description,
        longDescription: product.longDescription || product.description,
        shortDescription:
          product.shortDescription ||
          (product.description ? product.description.substring(0, 200) : ""),
        price: product.price,
        comparePrice: product.comparePrice || null,
        discountPrice: product.comparePrice || null,
        sku: sku,
        stock: product.stock,
        category: categoryId,
        categoryName: product.category,
        brand: product.brand || "Elista",
        images: formattedImages,
        colors: product.colors || [],
        sizes: product.sizes || [],
        tags: product.tags || [],
        specifications: product.specifications || {},
        features: product.features || [],
        isActive: true,
        featured: product.featured || false,
        featuredOrder: product.featuredOrder || 0,
        seller: seller._id,
        averageRating: 0,
        totalReviews: 0,
        ratingsCount: 0,
        salesCount: 0,
        viewCount: 0,
        views: 0,
        relatedProducts: [],
      };

      productsToInsert.push(productData);
      console.log(`   ✓ Product ready`);
    }

    // ========== 5. INSERT ALL PRODUCTS ==========
    if (productsToInsert.length === 0) {
      throw new Error("No products were processed successfully!");
    }

    console.log(
      `\n💾 Inserting ${productsToInsert.length} products into database...`,
    );
    const result = await Product.insertMany(productsToInsert);
    console.log(`\n✅ Successfully seeded ${result.length} products!`);

    // ========== 6. UPDATE RELATED PRODUCTS ==========
    console.log("\n🔗 Updating related products...");
    for (const product of result) {
      const related = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
        isActive: true,
      }).limit(5);

      if (related.length > 0) {
        await Product.findByIdAndUpdate(product._id, {
          relatedProducts: related.map((r) => r._id),
        });
      }
    }
    console.log("   ✓ Related products updated");

    // ========== 7. UPDATE CATEGORY COUNTS ==========
    console.log("\n📊 Updating category counts...");
    for (const [categoryName, categoryId] of categoryMap) {
      const count = await Product.countDocuments({ category: categoryId });
      await Category.findByIdAndUpdate(categoryId, { productCount: count });
      console.log(`   ✓ ${categoryName}: ${count} products`);
    }

    // ========== 8. VERIFICATION ==========
    const finalCount = await Product.countDocuments();
    const featuredCount = await Product.countDocuments({ featured: true });

    console.log(`\n📊 FINAL SUMMARY:`);
    console.log(`   ✅ Products: ${finalCount}`);
    console.log(`   ⭐ Featured: ${featuredCount}`);
    console.log(`   📁 Categories: ${categoryMap.size}`);
    console.log(`   👤 Seller: ${seller.email}`);

    await mongoose.connection.close();
    console.log("\n🎉 Database seeding completed successfully!");

    return result;
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.stack) console.error(error.stack);
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

seedDatabase();
