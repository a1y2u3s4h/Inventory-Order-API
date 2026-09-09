const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 150,
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ""
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "stockQuantity must be an integer"
      }
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true
    }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", category: 1 });

module.exports = mongoose.model("Product", productSchema);