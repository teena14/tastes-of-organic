import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const products = [
  // ── Honey ─────────────────────────────────────────────────────────
  {
    name: "Van Tulsi Honey",
    description:
      "Rare wild-crafted Van Tulsi (forest basil) honey with a distinctively aromatic flavour and calming properties. Collected from remote, pesticide-free forest regions.",
    category: "HONEY",
    price: 649,
    mrp: 799,
    images: [
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80"
    ],
    stock: 35,
    isSubscriptionAllowed: true,
    isFeatured: true,
    tags: ["honey", "van tulsi", "tulsi", "wild", "organic"]
  },
  {
    name: "Wildforest Organic Honey",
    description:
      "Multi-floral raw honey harvested from untouched wild forests. Unfiltered, unpasteurised, and rich in natural pollen, enzymes, and antioxidants.",
    category: "HONEY",
    price: 549,
    mrp: 699,
    images: [
      "https://images.unsplash.com/photo-1601063458289-77247ba485ec?auto=format&fit=crop&w=600&q=80"
    ],
    stock: 55,
    isSubscriptionAllowed: true,
    isFeatured: true,
    tags: ["honey", "wildforest", "multifloral", "raw", "organic"]
  },
  {
    name: "Jamun Honey",
    description:
      "Dark, rich honey from Jamun (Indian blackberry) blossoms. Naturally low glycemic index with a bold, fruity sweetness—popular for everyday wellness routines.",
    category: "HONEY",
    price: 599,
    mrp: 749,
    images: [
      "https://images.unsplash.com/photo-1601063458289-77247ba485ec?auto=format&fit=crop&w=600&q=80"
    ],
    stock: 40,
    isSubscriptionAllowed: true,
    isFeatured: true,
    tags: ["honey", "jamun", "low GI", "organic"]
  },
  {
    name: "Ashwagandha Honey",
    description:
      "Pure forest honey infused with organic Ashwagandha root extract. Supports stress relief, better sleep, and daily vitality—ideal with warm water or milk.",
    category: "HONEY",
    price: 699,
    mrp: 849,
    images: [
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80"
    ],
    stock: 30,
    isSubscriptionAllowed: true,
    isFeatured: true,
    tags: ["honey", "ashwagandha", "adaptogen", "wellness", "organic"]
  },

  // ── Millets ─────────────────────────────────────────────────────────
  {
    name: "Organic Ragi (Finger Millet)",
    description:
      "Whole organic ragi grains—naturally gluten-free, high in calcium and fibre. Perfect for porridge, rotis, and healthy baking.",
    category: "MILLET",
    price: 229,
    mrp: 279,
    images: [
      "/images/ragi_millet.png"
    ],
    stock: 70,
    isSubscriptionAllowed: true,
    isFeatured: false,
    tags: ["millet", "ragi", "finger millet", "gluten-free", "organic"]
  },

  // ── Flour ───────────────────────────────────────────────────────────
  {
    name: "Organic Wheat Flour (Atta)",
    description:
      "100% organic chakki-ground whole wheat atta. Stone-milled for soft rotis with a natural earthy aroma—no bleach, additives, or preservatives.",
    category: "FLOUR",
    price: 279,
    mrp: 329,
    images: [
      "/images/wheat_flour.png"
    ],
    stock: 90,
    isSubscriptionAllowed: true,
    isFeatured: false,
    tags: ["flour", "wheat", "atta", "chakki", "organic"]
  },

  // ── Pulses ──────────────────────────────────────────────────────────
  {
    name: "Organic Toor Dal",
    description:
      "Premium split pigeon peas grown without chemicals. High in protein and fibre—ideal for everyday dal, sambar, and comfort meals.",
    category: "PULSES",
    price: 189,
    mrp: 229,
    images: [
      "/images/toor_dal.png"
    ],
    stock: 100,
    isSubscriptionAllowed: true,
    isFeatured: false,
    tags: ["pulses", "toor dal", "arhar", "protein", "organic"]
  },
  {
    name: "Organic Kali Dal (Whole Black Urad)",
    description:
      "Whole black urad dal with the skin intact—rich, earthy flavour and excellent for dals, stews, and traditional Punjabi kali dal recipes.",
    category: "PULSES",
    price: 199,
    mrp: 249,
    images: [
      "/images/kali_dal.png"
    ],
    stock: 85,
    isSubscriptionAllowed: true,
    isFeatured: false,
    tags: ["pulses", "kali dal", "urad", "black dal", "organic"]
  },

  // ── Juices ──────────────────────────────────────────────────────────
  {
    name: "Organic Aloe Vera Juice",
    description:
      "Cold-pressed aloe vera inner-leaf juice. Supports digestion, hydration, and healthy skin—no added sugar or artificial preservatives.",
    category: "JUICES",
    price: 349,
    mrp: 429,
    images: [
      "/images/aloe_vera_juice.png"
    ],
    stock: 65,
    isSubscriptionAllowed: true,
    isFeatured: true,
    tags: ["juice", "aloe vera", "digestive", "organic"]
  },
  {
    name: "Organic Amla Juice",
    description:
      "Fresh-pressed Indian gooseberry juice packed with Vitamin C and antioxidants. A tangy daily tonic for immunity and natural energy.",
    category: "JUICES",
    price: 329,
    mrp: 399,
    images: [
      "/images/amla_juice.png"
    ],
    stock: 60,
    isSubscriptionAllowed: true,
    isFeatured: false,
    tags: ["juice", "amla", "vitamin C", "immunity", "organic"]
  },

  // ── Spices ──────────────────────────────────────────────────────────
  {
    name: "Organic Mirchi Powder (Red Chilli)",
    description:
      "Sun-dried, stone-ground red chilli powder with vibrant colour and balanced heat. Adds depth to curries, pickles, and everyday cooking.",
    category: "SPICES",
    price: 149,
    mrp: 189,
    images: [
      "/images/mirchi_powder.png"
    ],
    stock: 120,
    isSubscriptionAllowed: true,
    isFeatured: false,
    tags: ["spices", "mirchi", "chilli", "organic"]
  },
  {
    name: "Organic Haldi Powder (Turmeric)",
    description:
      "High-curcumin organic turmeric powder from single-origin farms. Warm, earthy aroma—essential for curries, golden milk, and daily wellness.",
    category: "SPICES",
    price: 179,
    mrp: 219,
    images: [
      "/images/haldi_powder.png"
    ],
    stock: 110,
    isSubscriptionAllowed: true,
    isFeatured: true,
    tags: ["spices", "haldi", "turmeric", "curcumin", "organic"]
  },

  // ── Combos ──────────────────────────────────────────────────────────
  {
    name: "Immunity Booster Combo",
    description: "A perfect blend of Amla Juice and Haldi Powder to boost your daily immunity naturally. Includes 1 bottle of Amla Juice and 1 pack of Haldi Powder.",
    category: "COMBOS",
    price: Math.round((329 + 179) * 0.9), // 10% discount
    mrp: 399 + 219,
    comboItems: [
      "1x Organic Amla Juice (500ml)",
      "1x Organic Haldi Powder (250g)"
    ],
    comboCategories: ["JUICES", "SPICES"],
    images: [
      "/images/amla_juice.png",
      "/images/haldi_powder.png"
    ],
    stock: 50,
    isSubscriptionAllowed: false,
    isFeatured: true,
    tags: ["combo", "immunity", "amla", "haldi", "organic"]
  },
  {
    name: "Essential Kitchen Combo",
    description: "Stock up your pantry with organic staples: Wheat Flour (Atta), Toor Dal, and Mirchi Powder. Nutrient-rich and chemical-free.",
    category: "COMBOS",
    price: Math.round((279 + 189 + 149) * 0.9), // 10% discount
    mrp: 329 + 229 + 189,
    comboItems: [
      "1x Organic Wheat Flour (5kg)",
      "1x Organic Toor Dal (1kg)",
      "1x Organic Mirchi Powder (250g)"
    ],
    comboCategories: ["FLOUR", "WHEAT", "PULSES", "SPICES"],
    images: [
      "/images/wheat_flour.png",
      "/images/toor_dal.png",
      "/images/mirchi_powder.png"
    ],
    stock: 40,
    isSubscriptionAllowed: false,
    isFeatured: true,
    tags: ["combo", "kitchen", "flour", "dal", "mirchi", "organic"]
  }
];


const seedProducts = async () => {
  try {
    await connectDB();

    await Product.deleteMany();
    console.log("Existing products cleared");

    await Product.insertMany(products);
    console.log(`✅ ${products.length} products seeded successfully`);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProducts();

