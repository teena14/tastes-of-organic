import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        size: String,
        quantity: Number
      }
    ],

    durationMonths: {
      type: Number,
      enum: [3, 6, 12],
      required: true
    },

    discountPercent: {
      type: Number,
      required: true
    },

    totalPaid: {
      type: Number,
      required: true
    },

    startDate: {
      type: Date,
      default: Date.now
    },

    nextDeliveryDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "CANCELLED", "COMPLETED"],
      default: "PENDING"
    },

    phonePeTransactionId: { type: String, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
