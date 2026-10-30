import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      enum: [
        "HONEY",
        "PULSES",
        "WHEAT",
        "MILLET",
        "SPICES",
        "OILS",
        "JUICE",
        "JUICES",
        "FLOUR",
        "COMBOS"
      ],
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    images: [
      {
        type: String
      }
    ],

    comboItems: [{ type: String }],
    comboCategories: [{ type: String }],

    sizes: [
      {
        size: { type: String, required: true },
        price: { type: Number, required: true },
        mrp: { type: Number, default: 0 }
      }
    ],

    stock: {
      type: Number,
      default: 0
    },

    isSubscriptionAllowed: {
      type: Boolean,
      default: true
    },

    rating: {
      type: Number,
      default: 0
    },

    reviewCount: {
      type: Number,
      default: 0
    },

    mrp: {
      type: Number,
      default: 0
    },

    tags: [{ type: String }],

    isFeatured: {
      type: Boolean,
      default: false
    },

    concern: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// Canonicalize category: normalize JUICE to JUICES
productSchema.pre("validate", function (next) {
  if (this.category === "JUICE") {
    this.category = "JUICES";
  }
  next();
});

productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: "text", description: "text" });

export default mongoose.model("Product", productSchema);
