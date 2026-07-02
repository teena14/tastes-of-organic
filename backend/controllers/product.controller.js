import Product from "../models/Product.js";
import Review from "../models/Review.js";

export const getProducts = async (req, res) => {
  try {
    const { search, category, concern, sort, featured } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category && category !== "ALL") {
      const categories = category.split(',').map(c => c.trim().toUpperCase());
      query.$or = [
        { category: { $in: categories } },
        { category: "COMBOS", comboCategories: { $in: categories } }
      ];
    }

    if (concern && concern !== "ALL") {
      const concerns = concern.split(',').map(c => c.trim().toLowerCase());
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

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortOption).skip(skip).limit(limit);

    return res.json({
      success: true,
      count: products.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: products
    });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({ message: "Failed to fetch products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = await Review.find({ product: product._id }).populate("user", "name").sort("-createdAt");

    return res.json({ success: true, data: { ...product._doc, reviews } });
  } catch (error) {
    console.error("Get product by id error:", error);
    return res.status(500).json({ message: "Failed to fetch product" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ message: "Failed to create product" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ success: true, data: product });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ message: "Failed to update product" });
  }
};
