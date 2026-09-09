const express = require("express");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { orderSchema } = require("../schemas/order");
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/orderController");

const router = express.Router();

router.use(auth);
router.post("/", validate(orderSchema), asyncHandler(controller.createOrder));
router.get("/", asyncHandler(controller.getOrders));
router.get("/:id", asyncHandler(controller.getOrder));

module.exports = router;