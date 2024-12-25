import { Router } from "express";
import { authenticateAdmin } from "../middlewares/auth.js";
import { getSingleGuest, updateGuestDetails, deleteGuest } from "../controllers/guest.js";
import { validateGuestData } from "../middlewares/guest.js";

const router = Router();

// View Guest Details
router.get("/:id", authenticateAdmin, getSingleGuest);

// Edit Guest Details
router.put("/:id", authenticateAdmin, validateGuestData, updateGuestDetails);

router.delete("/:id",authenticateAdmin, deleteGuest);

export default router;
