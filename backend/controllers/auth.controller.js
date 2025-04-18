import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import User from "../models/user.model.js";
import otpModel from "../models/otp.model.js";
import { setCookie, clearCookie } from "../helper/cookieHelper.js";

// Register user and send OTP

export const Register = async (req, res) => {
  const { email, password, role} = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const newUser = new User({ email, password, role });
  await newUser.save();

  await otpModel.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes
  });

  const sent = await sendEmail(email, "Your OTP for RehabMotion", `<p>Your OTP is <strong>${otp}</strong></p>`);
  if (!sent) return res.status(500).json({ message: "Failed to send OTP" });

  res.status(200).json({ message: "Registered. Please verify OTP sent to your email." });
};

export const VerifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const otpRecord = await otpModel.findOne({ email, otp });
  // console.log(otpRecord);

  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  await User.updateOne({ email }, { verified: true });
  await otpModel.deleteOne({ email });

  res.status(200).json({ message: "OTP verified successfully" });
};

// Resend OTP
export const ResendOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await otpModel.updateOne(
    { email },
    { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    { upsert: true }
  );

  const sent = await sendEmail(email, "Your New OTP for RehabMotion", `<p>Your new OTP is <strong>${otp}</strong></p>`);
  if (!sent) return res.status(500).json({ message: "Failed to resend OTP" });

  res.status(200).json({ message: "OTP resent successfully" });
};

// Login user and set a JWT token
export const Login = async (req, res) => {
  const { email, password } = req.body;
  // console.log(email,password);
  const user = await User.findOne({ email });
  // console.log(user);

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  // Compare password (assuming you have a comparePassword method)
  const isMatch = await user.comparePassword(password);
  console.log(isMatch);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  if (!user.verified) {
    return res.status(403).json({ message: "Account not verified. Please verify OTP." });
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  // Set JWT in HTTP-only cookie
  setCookie(res, 'auth_token', token);

  res.status(200).json({ message: "Login successful" });
};

// Logout user and clear JWT cookie
export const Logout = (req, res) => {
  clearCookie(res, 'auth_token');
  res.status(200).json({ message: "Logout successful" });
};

// Forgot password and send reset link
export const ForgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "Email not found" });

  const token = crypto.randomBytes(20).toString("hex");
  user.resetToken = token;
  await user.save();

  const link = `http://localhost:3000/reset-password?token=${token}&email=${email}`;
  const sent = await sendEmail(email, "Password Reset Request", `<p>Click to reset your password: <a href="${link}">${link}</a></p>`);

  if (!sent) return res.status(500).json({ message: "Failed to send reset link" });

  res.status(200).json({ message: "Reset link sent to your email." });
};

// Reset password with the token
export const ResetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.resetToken !== token) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.password = newPassword;
  user.resetToken = null;
  await user.save();

  res.status(200).json({ message: "Password reset successful" });
};
