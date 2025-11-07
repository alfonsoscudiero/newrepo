// utilities/account-validation.js
// Required modules
const utilities = require(".")
const { body, validationResult } = require("express-validator")

// async duplicate-email check against the DB
const accountModel = require("../models/account-model")

// Create validate object
const validate = {}

/* ******************************
 * Registration Data Validation Rules
 * ****************************** */
validate.registrationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name.")
      .bail()
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters long."),

    // valid email is required and must not already exist
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
      // Returns a number (rowCount). 0 = not found; >0 = already registered.
      const emailExists = await accountModel.checkExistingEmail(account_email)
      if (emailExists) {
        // Throwing an Error
        throw new Error("Email exists. Please log in or use different email")
      }
    }),

    // password is required and must be strong
    body("account_password")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password does not meet requirements."
      ),
  ]
}

/* ******************************
 * Check data and return errors or continue
 *  - We render with the FULL "errors" RESULT object (not errors.array())
 *  - The register.ejs expects to call errors.array() in the template
 * ****************************** */
validate.checkRegData = async (req, res, next) => {
  const errors = validationResult(req)

  /* ===== TEMPORARY DEBUG LOGS (for VS Code terminal) =====
  You can delete or comment these out after verifying.
  --------------------------------------------------------- */
  console.log("Validation result object:", errors)
  console.log("Error messages (if any):", errors.array())
  /* ================== END TEMPORARY DEBUG ================= */


  if (!errors.isEmpty()) {
    const nav = await utilities.getNav() // keep site nav available to layout

    return res.render("account/register", {
      title: "Register",
      nav,
      errors, // <-- pass the whole result object (DO NOT use errors.array() here)
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    })
  }

  // No validation errors → continue to controller
  console.log("Validation passed — proceeding to controller.") // TEMPORARY DEBUG
  next()
}

/* ******************************
 * Login Data Validation Rules
 * Valid email + non-empty password
 * ****************************** */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address."),
      
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Please provide a password."),
  ]
}

/* ******************************
 * Check login data and return errors or continue
 *  - On error, re-render login.ejs with messages
 * ****************************** */
validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req)

  console.log("Login validation result object:", errors)
  console.log("Login error messages (if any):", errors.array())

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()

    return res.render("account/login", {
      title: "Login",
      nav,
      errors, // full result object
      account_email: req.body.account_email,
    })
  }

  console.log("Login validation passed — proceeding to controller.")
  next()
}


module.exports = validate