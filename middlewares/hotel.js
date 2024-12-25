import { body } from "express-validator";

const validateHotelData = [
  body("name").notEmpty().withMessage("Hotel name is required"),
  body("address").notEmpty().withMessage("Address is required"),
];

export { validateHotelData };