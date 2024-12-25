import jwt from "jsonwebtoken";
import { check } from "express-validator";

const validateRegisterData = [
  check("email", "Invalid email").isEmail(),
  check("password", "Password must be at least 6 characters").isLength({
    min: 6,
  }),
  check("role", "Role must be either MainAdmin or GuestAdmin").isIn([
    "MainAdmin",
    "GuestAdmin",
  ]),
];

const verifyMainAdmin = (req, res, next) => {
  const { role } = req.user;
  if (role !== "MainAdmin") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
};

const authenticateAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};

export { validateRegisterData, verifyMainAdmin, authenticateAdmin };
