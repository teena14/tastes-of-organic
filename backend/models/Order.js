import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  name: String,
  image: String,
  price: Number,
  quantity: Number
});

const shippingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  postalCode: String
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [orderItemSchema],

    shippingAddress: shippingSchema,

    subtotal: Number,
    delivery: Number,
    total: Number,

    paymentMethod: {
      type: String,
      enum: ["online", "cod"],
      default: "online"
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },

    orderStatus: {
      type: String,
      enum: ["placed", "processing", "shipped", "delivered"],
      default: "placed"
    },

    isSubscription: {
      type: Boolean,
      default: false
    },

    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;