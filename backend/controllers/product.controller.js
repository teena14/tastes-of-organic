import Product from "../models/Product.js";
import Review from "../models/Review.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

const MAX_PAGE_LIMIT = 100;

export const getProducts = asyncHandler(async (req, res) => {
  const { search, category, concern, sort, featured } = req.query;

  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (category && category !== "ALL") {
    const categories = category
      .split(",")
      .map((c) => {
        const trimmed = c.trim().toUpperCase();
        return trimmed === "JUICE" ? "JUICES" : trimmed;
      });
    query.$or = [
      { category: { $in: categories } },
      { category: "COMBOS", comboCategories: { $in: categories } },
    ];
  }

  if (concern && concern !== "ALL") {
    const concerns = concern.split(",").map((c) => c.trim().toLowerCase());
    query.concern = { $in: concerns };
  }

  if (featured === "true") {
    query.isFeatured = true;
  }

  let sortOption = { createdAt: -1 };
  if (sort === "price-asc") sortOption = { price: 1 };
  if (sort === "price-desc") sortOption = { price: -1 };
  if (sort === "rating") sortOption = { rating: -1 };
  if (sort === "newest") sortOption = { createdAt: -1 };

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    MAX_PAGE_LIMIT,
    Math.max(1, parseInt(req.query.limit, 10) || 20)
  );
  const skip = (page - 1) * limit;

  // Execute count and paginated query in parallel with lean projection
  const [total, products] = await Promise.all([
    Product.countDocuments(query),
    Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return res.json({
    success: true,
    count: products.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
    data: products,
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  // Parallel lean fetch of product and reviews
  const [product, reviews] = await Promise.all([
    Product.findById(req.params.id).lean(),
    Review.find({ product: req.params.id })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  if (!product) {
    throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  }

  return res.json({
    success: true,
    data: { ...product, reviews },
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  return res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  }

  return res.json({ success: true, data: product });
});
