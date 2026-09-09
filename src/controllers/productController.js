const mongoose = require("mongoose");
const Product = require("../models/Product");

function parsePositiveInt(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

async function createProduct(req, res) {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
}

async function getProducts(req, res) {
  const { search, category, inStock } = req.query;
  const page = parsePositiveInt(req.query.page, 1, 1000000);
  const limit = parsePositiveInt(req.query.limit, 10, 100);

  const filter = {};

  if (search) {
    filter.name = { $regex: search.trim(), $options: "i" };
  }

  if (category) {
    filter.category = category.trim();
  }

  if (inStock !== undefined) {
    if (inStock === "true") filter.stockQuantity = { $gt: 0 };
    else if (inStock === "false") filter.stockQuantity = { $eq: 0 };
    else {
      return res.status(400).json({
        success: false,
        message: "inStock must be true or false"
      });
    }
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}

async function getProduct(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product id" });
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, data: product });
}

async function updateProduct(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product id" });
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, data: product });
}

async function deleteProduct(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product id" });
  }

  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, message: "Product deleted successfully" });
}

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
};