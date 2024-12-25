import mongoose, { Schema, model } from "mongoose";

const guestSchema = new Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,  
  },
  fullName: {
    type: String,
    required: true, 
  },
  mobileNumber: {
    type: String,
    required: true, 
  },
  address: {
    type: String,
    required: true, 
  },
  purposeOfVisit: {
    type: String,
    enum: ["Business", "Personal", "Tourist"],
    required: true, 
  },
  checkInDate: {
    type: Date,
    required: true,  
  },
  checkOutDate: {
    type: Date,
    required: true,  
  },
  email: {
    type: String,
    required: true, 
  },
  idProofNumber: {
    type: String,
    required: true,  
  },
});

guestSchema.path("checkOutDate").validate(function (value) {
  return value > this.checkInDate;
}, "The check-out date must be after the check-in date");

const Guest = model("Guest", guestSchema);
export default Guest;
