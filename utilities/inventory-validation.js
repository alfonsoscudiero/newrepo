// utilities/inventory-validation.js
// Required modules
const utilities = require(".")
const { body, validationResult } = require("express-validator")

const invValidate = {}

/* **************************************
 *  Classification Name Validation Rules
 * ************************************** */
invValidate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a classification name.")
      .bail() // stop running validations if the previous one failed
      .matches(/^[A-Za-z]+$/)
      .withMessage("Use only alphabetic characters (A–Z, no spaces or numbers)."),
  ]
}

/* **************************************
 *  Check classification data and return errors or continue
 * ************************************** */
invValidate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()

    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(), // convert to array for EJS
      classification_name: req.body.classification_name, // keep sticky input
    })
  }
  // No errors → continue to controller (insert into DB)
  next()
}

module.exports = invValidate