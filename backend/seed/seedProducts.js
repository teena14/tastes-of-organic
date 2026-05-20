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
  // ── Existing products ─────────────────────────────────────────────
  {
    name: "Raw Organic Honey",
    description: "Pure, unprocessed organic honey sourced directly from forests. Rich in antioxidants and natural enzymes.",
    category: "HONEY",
    price: 499,
    mrp: 599,
    images: [
      "https://images.unsplash.com/photo-1587049352847-4d451cb5ad26?auto=format&fit=crop&w=600&q=80"
    ],
    stock: 50,
    isSubscriptionAllowed: true,
    isFeatured: true,
    tags: ["honey", "organic", "raw"]
  },
  {
    name: "Organic Toor Dal",
    description: "High-quality organic toor dal, rich in protein and sourced from certified organic farms.",
    category: "PULSES",
    price: 189,
    mrp: 229,
    images: [
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80"
    ],
    stock: 100,
    isSubscriptionAllowed: true,
    isFeatured: false,
    tags: ["pulses", "dal", "protein"]
  },
  {
    name: "Whole Wheat Atta",
    description: "Stone-ground organic whole wheat flour, perfect for soft chapatis and healthy baking.",
    category: "WHEAT",
    price: 299,
    mrp: 349,
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"
    ],
    stock: 80,
    isSubscriptionAllowed: true,
    isFeatured: false,
    tags: ["wheat", "atta", "flour"]
  },
  {
    name: "Organic Foxtail Millet",
    description: "Healthy organic millet packed with nutrients. Gluten-free and rich in fibre and minerals.",
    category: "MILLET",
    price: 249,
    mrp: 299,
    images: [
      "https://images.unsplash.com/photo-1621252178229-2be81fb1ca03?auto=format&fit=crop&w=600&q=80"
    ],
    stock: 60,
    isSubscriptionAllowed: true,
    isFeatured: false,
    tags: ["millet", "gluten-free", "grains"]
  },

  // ── New products ───────────────────────────────────────────────────
  {
    name: "Van Tulsi Honey",
    description: "Rare wild-crafted Van Tulsi (Forest Basil) honey with a distinctively aromatic flavour and powerful medicinal properties. Collected from remote untouched forest regions.",
    category: "HONEY",
    price: 649,
    mrp: 799,
    images: [
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80"
    ],
    stock: 35,
    isSubscriptionAllowed: true,
    isFeatured: true,
    tags: ["honey", "tulsi", "van tulsi", "wild honey", "medicinal", "organic"]
  },
  {
    name: "Jamun Honey",
    description: "Dark, rich honey collected from Jamun (Indian Blackberry) blossoms. Known for its low glycemic index and benefits for diabetics. Bold, fruity, and naturally sweet.",
    category: "HONEY",
    price: 599,
    mrp: 749,
    images: [
      "https://images.unsplash.com/photo-1601063458289-77247ba485ec?auto=format&fit=crop&w=600&q=80"
    ],
    stock: 40,
    isSubscriptionAllowed: true,
    isFeatured: true,
    tags: ["honey", "jamun", "diabetic-friendly", "low GI", "organic"]
  },
  {
    name: "Wildforest Organic Honey",
    description: "Multi-floral raw honey harvested from untouched wild forests. Unfiltered, unpasteurised and packed with natural pollen, enzymes, and antioxidants.",
    category: "HONEY",
    price: 549,
    mrp: 699,
    images: [
      "https://images.unsplash.com/photo-1471943038655-ee7c88ffbae4?auto=format&fit=crop&w=600&q=80"
    ],
    stock: 55,
    isSubscriptionAllowed: true,
    isFeatured: true,
    tags: ["honey", "wild", "multifloral", "raw", "organic", "unfiltered"]
  },
  {
    name: "Atta (Organic Wheat Flour)",
    description: "100% organic chakki-fresh atta stone-ground from premium whole wheat grains. Makes soft, nutritious rotis with a natural earthy aroma. No additives or preservatives.",
    category: "FLOUR",
    price: 279,
    mrp: 329,
    images: [
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"
    ],
    stock: 90,
    isSubscriptionAllowed: true,
    isFeatured: false,
    tags: ["atta", "flour", "wheat", "chakki", "organic"]
  },
  {
    name: "Kodu ka Aata (Kodo Millet Flour)",
    description: "Ancient-grain Kodo Millet flour — naturally gluten-free, high in fibre and antioxidants. Ideal for making healthy rotis, dosas, and baked goods. A true superfood flour.",
    category: "FLOUR",
    price: 319,
    mrp: 389,
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80"
    ],
    stock: 45,
    isSubscriptionAllowed: true,
    isFeatured: false,
    tags: ["kodo", "millet flour", "gluten-free", "ancient grain", "aata", "organic"]
  },
  {
    name: "Aloe Vera Juice",
    description: "Cold-pressed pure Aloe Vera juice made from hand-harvested inner leaf gel. Supports digestion, boosts immunity, and promotes healthy skin. No added sugar or preservatives.",
    category: "JUICES",
    price: 349,
    mrp: 429,
    images: [
      "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=600&q=80"
    ],
    stock: 70,
    isSubscriptionAllowed: true,
    isFeatured: true,
    tags: ["aloe vera", "juice", "digestive", "skin care", "immunity", "organic"]
  },
  {
    name: "Buras Juice (Rhododendron Flower Juice)",
    description: "Handcrafted Buras (Buransh / Rhododendron) flower juice sourced from the Himalayan hills of Uttarakhand. Rich in Vitamin C and natural antioxidants. A rare seasonal Himalayan treasure.",
    category: "JUICES",
    price: 399,
    mrp: 499,
    images: [
      "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=600&q=80"
    ],
    stock: 30,
    isSubscriptionAllowed: false,
    isFeatured: true,
    tags: ["buras", "buransh", "rhododendron", "himalayan", "juice", "seasonal", "vitamin C"]
  }
];

// 🚀 Run seed
const seedProducts = async () => {
  try {
    await connectDB();

    // Clear existing products first
    await Product.deleteMany();
    console.log("Existing products cleared");

    // Insert all products
    await Product.insertMany(products);
    console.log(`✅ ${products.length} products seeded successfully`);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProducts();
