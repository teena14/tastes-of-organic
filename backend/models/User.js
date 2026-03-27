import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER"
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: []
      }
    ],

    address: {
      name: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String
    },

    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        quantity: {
          type: Number,
          default: 1
        }
      }
    ],

    resetOtp: { type: String, default: null },
    resetOtpExpiry: { type: Date, default: null },
    resetOtpVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
