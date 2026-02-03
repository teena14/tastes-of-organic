import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

// 🔌 Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// 🌱 Seed data
const products = [
  {
    name: "Raw Organic Honey",
    description: "Pure, unprocessed organic honey sourced directly from forests.",
    category: "HONEY",
    price: 499,
    images: [
      "https://via.placeholder.com/300x300.png?text=Honey"
    ],
    stock: 50,
    isSubscriptionAllowed: true
  },
  {
    name: "Organic Toor Dal",
    description: "High-quality organic toor dal, rich in protein.",
    category: "PULSES",
    price: 189,
    images: [
      "https://via.placeholder.com/300x300.png?text=Toor+Dal"
    ],
    stock: 100,
    isSubscriptionAllowed: true
  },
  {
    name: "Whole Wheat Atta",
    description: "Stone-ground organic whole wheat flour.",
    category: "WHEAT",
    price: 299,
    images: [
      "https://via.placeholder.com/300x300.png?text=Wheat"
    ],
    stock: 80,
    isSubscriptionAllowed: true
  },
  {
    name: "Organic Foxtail Millet",
    description: "Healthy organic millet packed with nutrients.",
    category: "MILLET",
    price: 249,
    images: [
      "https://via.placeholder.com/300x300.png?text=Millet"
    ],
    stock: 60,
    isSubscriptionAllowed: true
  }
];

// 🚀 Run seed
const seedProducts = async () => {
  try {
    await connectDB();

    // Optional: clear existing products
    await Product.deleteMany();
    console.log("Existing products cleared");

    // Insert new products
    await Product.insertMany(products);
    console.log("Products seeded successfully");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProducts();
