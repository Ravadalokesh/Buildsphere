const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z
    .enum(["project_manager", "site_engineer", "vendor", "viewer"])
    .optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );
}

async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await User.create(data);
    const token = signToken(user);

    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(data.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login };
