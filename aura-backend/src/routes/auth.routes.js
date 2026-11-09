const express = require("express");
const { body } = require("express-validator");

const {
  forgotPassword,
  getMe,
  login,
  logout,
  register,
  resetPassword
} = require("../controllers/auth.controller");
const authenticate = require("../middleware/authenticate");
const validateRequest = require("../middleware/validate-request");
const { rateLimit } = require("express-rate-limit");

const router = express.Router();
const passwordResetRequestLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password-reset requests. Please try again later.",
    error: { code: "RATE_LIMIT_EXCEEDED" }
  }
});

router.post(
  "/register",
  [
    body("name")
      .isString()
      .withMessage("Name must be a string.")
      .bail()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters."),
    body("email")
      .isString()
      .withMessage("Email must be a string.")
      .bail()
      .trim()
      .isEmail()
      .withMessage("Enter a valid email address.")
      .bail()
      .isLength({ max: 254 })
      .withMessage("Email must not exceed 254 characters.")
      .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
    body("password")
      .isString()
      .withMessage("Password must be a string.")
      .bail()
      .isLength({ min: 8, max: 72 })
      .withMessage("Password must be between 8 and 72 characters.")
      .custom((password) => Buffer.byteLength(password, "utf8") <= 72)
      .withMessage("Password must not exceed 72 bytes.")
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email")
      .isString()
      .withMessage("Email must be a string.")
      .bail()
      .trim()
      .isEmail()
      .withMessage("Enter a valid email address.")
      .bail()
      .isLength({ max: 254 })
      .withMessage("Email must not exceed 254 characters.")
      .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
    body("password")
      .isString()
      .withMessage("Password must be a string.")
      .bail()
      .isLength({ min: 1, max: 72 })
      .withMessage("Password must not exceed 72 characters.")
      .custom((password) => Buffer.byteLength(password, "utf8") <= 72)
      .withMessage("Password must not exceed 72 bytes.")
  ],
  validateRequest,
  login
);

router.get("/me", authenticate, getMe);
router.post(
  "/forgot-password",
  passwordResetRequestLimit,
  [
    body("email")
      .isString()
      .withMessage("Email must be a string.")
      .bail()
      .trim()
      .isEmail()
      .withMessage("Enter a valid email address.")
      .bail()
      .isLength({ max: 254 })
      .withMessage("Email must not exceed 254 characters.")
      .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false })
  ],
  validateRequest,
  forgotPassword
);
router.post(
  "/reset-password",
  [
    body("token")
      .isString()
      .withMessage("Reset token must be a string.")
      .bail()
      .isHexadecimal()
      .isLength({ min: 64, max: 64 })
      .withMessage("Reset token is invalid."),
    body("password")
      .isString()
      .withMessage("Password must be a string.")
      .bail()
      .isLength({ min: 8, max: 72 })
      .withMessage("Password must be between 8 and 72 characters.")
      .custom((password) => Buffer.byteLength(password, "utf8") <= 72)
      .withMessage("Password must not exceed 72 bytes.")
  ],
  validateRequest,
  resetPassword
);
router.post("/logout", authenticate, logout);

module.exports = router;
