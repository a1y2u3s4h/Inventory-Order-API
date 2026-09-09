const bcrypt = require("bcryptjs");
const User = require("../models/User");
const signToken = require("../utils/token");

async function register(req, res) {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashedPassword });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: { id: user._id, name: user.name, email: user.email },
      token: signToken(user)
    }
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: { id: user._id, name: user.name, email: user.email },
      token: signToken(user)
    }
  });
}

module.exports = { register, login };