const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");

async function createOrder(req, res) {
  // Each product is reserved with an atomic conditional update:
  // stockQuantity >= requested quantity.
  // This prevents two concurrent requests from both buying the last stock.
  const requested = req.body.products;

  const merged = new Map();
  for (const item of requested) {
    if (!mongoose.isValidObjectId(item.productId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid product id: ${item.productId}`
      });
    }
    merged.set(item.productId, (merged.get(item.productId) || 0) + item.quantity);
  }

  const reserved = [];

  try {
    for (const [productId, quantity] of merged.entries()) {
      const product = await Product.findOneAndUpdate(
        {
          _id: productId,
          stockQuantity: { $gte: quantity }
        },
        { $inc: { stockQuantity: -quantity } },
        { new: true }
      );

      if (!product) {
        const exists = await Product.exists({ _id: productId });
        const reason = exists
          ? `Insufficient stock for product ${productId}`
          : `Product ${productId} not found`;
        const error = new Error(reason);
        error.statusCode = exists ? 409 : 404;
        throw error;
      }

      reserved.push({
        product,
        quantity
      });
    }

    const products = reserved.map(({ product, quantity }) => ({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
      subtotal: Number((product.price * quantity).toFixed(2))
    }));

    const totalAmount = Number(
      products.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)
    );

    const order = await Order.create({
      user: req.user.userId,
      products,
      totalAmount,
      status: "confirmed"
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order
    });
  } catch (err) {
    // Roll back stock if order creation fails after reservation.
    if (reserved.length > 0) {
      await Promise.all(
        reserved.map(({ product, quantity }) =>
          Product.updateOne(
            { _id: product._id },
            { $inc: { stockQuantity: quantity } }
          )
        )
      );
    }
    throw err;
  }
}

async function getOrders(req, res) {
  const orders = await Order.find({ user: req.user.userId })
    .populate("products.product", "name category")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: orders });
}

async function getOrder(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid order id" });
  }

  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.userId
  }).populate("products.product", "name category");

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found"
    });
  }

  res.json({ success: true, data: order });
}

module.exports = { createOrder, getOrders, getOrder };