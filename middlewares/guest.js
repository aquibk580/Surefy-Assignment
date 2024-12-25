import { body } from "express-validator";

const validateGuestData = [
  body("fullName")
    .isString()
    .withMessage("Full name must be a string")
    .notEmpty()
    .withMessage("Full name is required"),
  body("mobileNumber")
    .isString()
    .notEmpty()
    .matches(/^[0-9]{10}$/)
    .withMessage("Mobile number must be 10 digits"),
  body("address").isString().notEmpty().withMessage("Address is required"),
  body("purposeOfVisit")
    .isIn(["Business", "Personal", "Tourist"])
    .withMessage("Purpose of visit must be Business, Personal or Tourist"),
  body("checkInDate").custom((value) => {
    const isValidDate = (dateString) => {
      const [day, month, year] = dateString.split("/");
      const date = new Date(`${year}-${month}-${day}`);
      return !isNaN(date.getTime());
    };
    if (!isValidDate(value)) {
      throw new Error(
        "Check-in date must be a valid date in dd/mm/yyyy format"
      );
    }
    return true;
  }),
  body("checkOutDate").custom((value, { req }) => {
    const isValidDate = (dateString) => {
      const [day, month, year] = dateString.split("/");
      const date = new Date(`${year}-${month}-${day}`);
      return !isNaN(date.getTime());
    };
    if (!isValidDate(value)) {
      throw new Error(
        "Check-out date must be a valid date in dd/mm/yyyy format"
      );
    }
    const [checkInDay, checkInMonth, checkInYear] =
      req.body.checkInDate.split("/");
    const checkInDate = new Date(
      `${checkInYear}-${checkInMonth}-${checkInDay}`
    );
    const [checkOutDay, checkOutMonth, checkOutYear] = value.split("/");
    const checkOutDate = new Date(
      `${checkOutYear}-${checkOutMonth}-${checkOutDay}`
    );
    if (checkOutDate <= checkInDate) {
      throw new Error("Check-out date must be after check-in date");
    }
    return true;
  }),
  body("email")
    .optional() // Apply the validation and normalization only if the email is present
    .isEmail()
    .withMessage("Email must be a valid email address")
    .normalizeEmail(),

  body("idProofNumber")
    .isString()
    .notEmpty()
    .withMessage("ID Proof Number is required"),
];

export { validateGuestData };
