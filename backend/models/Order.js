import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        quantity: Number,
        priceAtPurchase: Number
      }
    ],

    totalAmount: {
      type: Number,
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING"
    },

    paymentId: String,

    shippingAddress: {
      type: String,
      required: true
    },

    contactPhone: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
