import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    comment: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
