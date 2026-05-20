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
        "FLOUR"
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
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
