import { Schema, model } from "mongoose";

const hotelSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  qrcode: {
    type: String,
  },
});

const Hotel = model("Hotel", hotelSchema);
export default Hotel;
