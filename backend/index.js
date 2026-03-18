// ====================== IMPORTS ======================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { createClient } = require("redis");
const rateLimit = require("express-rate-limit");

// ====================== APP ======================
const app = express();
app.use(cors({
  origin: "https://emailverification1-1.onrender.com",
  credentials: true
}));
app.use(express.json());

// ====================== RATE LIMIT ======================
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { message: "Too many OTP requests, try later" },
});

// ====================== MONGODB ======================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ====================== USER MODEL ======================
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// ====================== REDIS ======================
const redis = createClient({ url: process.env.REDIS_URL });
redis.connect();
redis.on("error", err => console.log("Redis Error:", err));

// ====================== MAIL (BREVO) ======================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOTP = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"Auth App" abcakroy6969@gmail.com`,
      to: email,
      subject: "OTP Verification",
      html: `<h2>Your OTP: ${otp}</h2><p>Valid for 5 minutes</p>`
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};

// ====================== HELPERS ======================
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

const generateToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

// ====================== ROUTES ======================

// SIGNUP
app.post("/api/auth/signup", otpLimiter, async (req, res) => {
  const { email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);

  await User.create({ email, password: hashed });

  const otp = generateOTP();

  await redis.set(`otp:${email}`, otp, { EX: 300 });

  await sendOTP(email, otp);

  res.json({ message: "OTP sent" });
});

// VERIFY
app.post("/api/auth/verify", async (req, res) => {
  const { email, otp } = req.body;

  const stored = await redis.get(`otp:${email}`);

  if (!stored) return res.json({ message: "OTP expired" });

  if (stored != otp)
    return res.json({ message: "Invalid OTP" });

  await User.updateOne({ email }, { isVerified: true });

  await redis.del(`otp:${email}`);

  res.json({ message: "Verified successfully" });
});

// RESEND OTP
app.post("/api/auth/resend-otp", otpLimiter, async (req, res) => {
  const { email } = req.body;

  const cooldown = await redis.get(`cooldown:${email}`);
  if (cooldown)
    return res.json({ message: "Wait before requesting again" });

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "User not found" });

  const otp = generateOTP();

  await redis.set(`otp:${email}`, otp, { EX: 300 });
  await redis.set(`cooldown:${email}`, "1", { EX: 60 });

  await sendOTP(email, otp);

  res.json({ message: "OTP resent" });
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.json({ message: "User not found" });

  if (!user.isVerified)
    return res.json({ message: "Verify email first" });

  const match = await bcrypt.compare(password, user.password);

  if (!match)
    return res.json({ message: "Wrong password" });

  const token = generateToken(user);

  res.json({ message: "Login success", token });
});

// PROTECTED
app.get("/api/protected", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: "Protected data", user: decoded });
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// ====================== START ======================
app.listen(process.env.PORT || 5000, () =>
  console.log("Server running")
);

