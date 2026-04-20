import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import http from "http";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import authRoutes from "./routes/AuthRoutes.js";
import userRoutes from "./routes/UserRoutes.js";
import productRoutes from "./routes/ProductRoutes.js";
import categoryRoutes from "./routes/CategoryRoutes.js";
import cartRoutes from "./routes/CartRoutes.js";
import orderRoutes from "./routes/OrderRoutes.js";
import paymentRoutes from "./routes/PaymentRoutes.js";
import reviewRoutes from "./routes/ReviewRoutes.js";
import wishlistRoutes from "./routes/WishlistRoutes.js";
import campaignRoutes from "./routes/CampaignRoutes.js";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import Campaign from "./models/Campaign.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log(
  "Cloudinary configured for ecommerce with cloud_name:",
  process.env.CLOUDINARY_CLOUD_NAME,
);

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "elista-ecommerce",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const upload = multer({ storage: storage });

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;
const databaseURL = process.env.MONGODB_URI;

console.log("databasesURL:", databaseURL);

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    exposedHeaders: ["set-cookie"],
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static("uploads"));
app.use("/public", express.static("public"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/campaigns", campaignRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Ecommerce API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/api/test-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({
      success: true,
      message: "Cloudinary is connected! Ready for product image uploads.",
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to connect to Cloudinary",
    });
  }
});

app.get("/api/test-db", async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    res.json({
      success: true,
      database: {
        status: states[dbState],
        readyState: dbState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Add test error handling endpoints (development only)
if (process.env.NODE_ENV === "development") {
  app.get("/api/test/error/validation", (req, res, next) => {
    const error = new Error("Validation error test");
    error.name = "ValidationError";
    error.errors = {
      email: { message: "Email is required" },
      password: { message: "Password must be at least 6 characters" },
    };
    next(error);
  });

  app.get("/api/test/error/not-found", (req, res, next) => {
    const error = new Error("Resource not found");
    error.statusCode = 404;
    next(error);
  });

  app.get("/api/test/error/server", (req, res, next) => {
    const error = new Error("Internal server error");
    error.statusCode = 500;
    next(error);
  });

  app.get("/api/test/error/async", async (req, res, next) => {
    // This will be caught by asyncHandler
    throw new Error("Async error test");
  });
}

// Setup Socket.IO (optional - for real-time notifications)
// const io = setupSocket(server);
// app.set("io", io);
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

// Handle 404 routes - Use the imported notFoundHandler
app.use(notFoundHandler);

// Error handling middleware (should be last)
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    mongoose.connection.close(false, () => {
      console.log("Database connection closed");
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    mongoose.connection.close(false, () => {
      console.log("Database connection closed");
      process.exit(0);
    });
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(databaseURL, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 5,
  })
  .then(() => {
    console.log("✅ Ecommerce database connection successful");

    server.listen(port, () => {
      console.log(`🚀 Ecommerce server is running at http://localhost:${port}`);
      console.log(
        `📚 API Documentation available at http://localhost:${port}/api-docs`,
      );
      console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);

      // Log test endpoints in development
      if (process.env.NODE_ENV === "development") {
        console.log("\n🧪 Test Error Endpoints (Development Only):");
        console.log(`GET  http://localhost:${port}/api/test/error/validation`);
        console.log(`GET  http://localhost:${port}/api/test/error/not-found`);
        console.log(`GET  http://localhost:${port}/api/test/error/server`);
        console.log(`GET  http://localhost:${port}/api/test/error/async`);
      }
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err.message);
    console.error(
      "Database URL used:",
      databaseURL?.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"),
    );
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

export { app, server, upload };
