import mongoose, { mongo } from "mongoose";
import Hotel from "../models/hotel.js";
import Guest from "../models/guest.js";
import { validationResult } from "express-validator";

// Submit Guest Details
async function submitGuestDetails(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { hotelId } = req.params;
  const {
    fullName,
    mobileNumber,
    address,
    purposeOfVisit,
    checkInDate,
    checkOutDate,
    email,
    idProofNumber,
  } = req.body;

  try {
    if (!hotelId || !mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({ error: "Invalid or missing hotel ID" });
    }

    const parseDate = (dateString) => {
      const [day, month, year] = dateString.split("/");
      return new Date(`${year}-${month}-${day}`);
    };

    const parsedCheckInDate = parseDate(checkInDate);
    const parsedCheckOutDate = parseDate(checkOutDate);

    if (
      isNaN(parsedCheckInDate.getTime()) ||
      isNaN(parsedCheckOutDate.getTime())
    ) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const hotel = await Hotel.findById({ _id: hotelId });

    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    const guest = new Guest({
      hotelId,
      fullName,
      mobileNumber,
      address,
      purposeOfVisit,
      checkInDate: parsedCheckInDate,
      checkOutDate: parsedCheckOutDate,
      email,
      idProofNumber,
    });

    await guest.save();

    return res.status(201).json({
      message: "Guest details submitted successfully",
      guest,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server error", details: error.message });
  }
}

// Get All Guests
async function getAllGuests(req, res) {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "missing or invalid id" });
  }

  try {
    const guests = await Guest.find({ hotelId: id });

    if (guests.length === 0) {
      return res.status(404).json({ error: "No guests found for this hotel" });
    }

    return res.status(200).json({ guests });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
}

// Get Single Guest
async function getSingleGuest(req, res) {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Missing or invalid guestId" });
  }

  try {
    const guest = await Guest.findOne({ _id: id });

    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    return res.status(200).json({ guest });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
}

// Edit Guest Details
async function updateGuestDetails(req, res) {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Missing or invalid guestId" });
  }

  try {
    const guest = await Guest.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    return res
      .status(200)
      .json({ message: "Guest Details Updated Successfully", guest });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error });
  }
}

// Delete Guest
async function deleteGuest(req, res) {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Missing or invalid guest id" });
  }

  try {
    const guest = await Guest.findByIdAndDelete(id);

    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    return res
      .status(200)
      .json({ message: "Guest Deleted Successfully", guest });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
}
export {
  submitGuestDetails,
  getAllGuests,
  getSingleGuest,
  updateGuestDetails,
  deleteGuest,
};
