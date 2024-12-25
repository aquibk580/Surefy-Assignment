import { Router } from "express";
import { verifyMainAdmin, authenticateAdmin } from "../middlewares/auth.js";
import {
  addHotel,
  getSingleHotel,
  getAllHotels,
  updateHotel,
  deleteHotel,
} from "../controllers/hotel.js";
import { submitGuestDetails, getAllGuests } from "../controllers/guest.js";
import { upload } from "../lib/upload.js";
import { validateHotelData } from "../middlewares/hotel.js";
import { validateGuestData } from "../middlewares/guest.js";

const router = Router();

// Add Hotel
router.post(
  "/addhotel",
  authenticateAdmin,
  verifyMainAdmin,
  upload.single("logo"),
  validateHotelData,
  addHotel
);

// Getting All Hotels
router.get("/", getAllHotels);

// Getting Single Hotel
router.get("/:id", getSingleHotel);

// Submit Guest Details
router.post("/:hotelId/guest", validateGuestData, submitGuestDetails);

// Get All Guests for a Sepecific Hotel
router.get("/:id/guests", authenticateAdmin, getAllGuests);

// Delete Hotel
router.delete("/:id", authenticateAdmin, verifyMainAdmin, deleteHotel);

// Edit Hotel
router.put(
  "/:id",
  authenticateAdmin,
  verifyMainAdmin,
  upload.single("logo"),
  updateHotel
);

export default router;
