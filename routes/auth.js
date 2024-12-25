import { Router } from "express";
import { validateRegisterData } from "../middlewares/auth.js";
import {
  registerAdmin,
  logoutAdmin,
  loginAdmin,
  isLogin,
} from "../controllers/auth.js";

const router = Router();

router.post("/register", validateRegisterData, registerAdmin);
router.post("/logout", logoutAdmin);
router.post("/login", loginAdmin);
router.post("/status", isLogin);

export default router;
