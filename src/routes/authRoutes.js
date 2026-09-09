const express = require("express");
const { register, login } = require("../controllers/authController");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../schemas/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));

module.exports = router;