import { validationResult } from "express-validator";
import Admin from "../models/admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

async function registerAdmin(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, role } = req.body;

  try {
    if (role === "MainAdmin") {
      const existingMainAdmin = await Admin.findOne({ role: "MainAdmin" });
      if (existingMainAdmin) {
        return res.status(400).json({ error: "MainAdmin already exists" });
      }
    }
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({ email, password: hashedPassword, role });
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "Admin registered successfully",
      admin,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", error });
  }
}

async function loginAdmin(req, res) {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentails" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Login successfull", admin });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
}

function logoutAdmin(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
}

// Get The User Login Status
async function isLogin(req, res) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });

    res.status(200).json({ message: "Authenticated", admin: decoded });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}
export { registerAdmin, logoutAdmin, loginAdmin, isLogin };
