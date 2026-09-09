const express = require("express");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { productCreateSchema, productUpdateSchema } = require("../schemas/product");
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/productController");

const router = express.Router();

router.use(auth);
router.post("/", validate(productCreateSchema), asyncHandler(controller.createProduct));
router.get("/", asyncHandler(controller.getProducts));
router.get("/:id", asyncHandler(controller.getProduct));
router.patch("/:id", validate(productUpdateSchema), asyncHandler(controller.updateProduct));
router.delete("/:id", asyncHandler(controller.deleteProduct));

module.exports = router;