import { Schema, model } from "mongoose";

const AdminSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["MainAdmin", "GuestAdmin"],
    default: "GuestAdmin",
  },
});

const Admin = model("Admin", AdminSchema);
export default Admin;
