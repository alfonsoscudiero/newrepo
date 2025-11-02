// utilities/inventory-validation.js
// Required modules
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model") // Needed to repopulate dropdowns and validate classification_id exists

const invValidate = {}

/* **************************************
 *  Classification Name Validation Rules
 * Assignment 04 - Task 02
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

    return res.status(400).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(), // convert to array for EJS
      classification_name: req.body.classification_name, // keep sticky input
    })
  }
  // No errors → continue to controller (insert into DB)
  next()
}

/* ******************************************************
 *  Classification Name Validation Rules - Add Inventory
 * Assignment 04 - Task 03
 * **************************************************** */
  invValidate.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Please choose a classification.")
      .bail()
      .toInt()
      .isInt({ min: 1 })
      .withMessage("Please choose a classification.")
      .bail()
      .custom(async (val) => {
        // Ask the model for that specific classification
        const result = await invModel.getClassificationById(val)
        // If not found, show this error
        if (!result || result.rows.length === 0) {
          throw new Error("Selected classification does not exist.")
        }
        return true // continue
      }),

    body("inv_make")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters."),

    body("inv_model")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("A description is required."),

    body("inv_price")
      .trim()
      .toFloat()
      .isFloat({ gt: 0 })
      .withMessage("Price must be a number greater than 0."),

    body("inv_year")
      .trim()
      .toInt()
      .isInt({ min: 1900, max: 9999 })
      .withMessage("Year must be a 4-digit year."),

    body("inv_miles")
      .trim()
      .matches(/^\d+$/) // Ensures only digits allowed (no commas/spaces)
      .withMessage("Miles must contain digits only (no commas or spaces).")
      .bail()
      .toInt()
      .isInt({ min: 0 })
      .withMessage("Miles must be digits only."),

    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("The vehicle's color is required."),
  ]
}

/* **************************************
 *  Add-Inventory Data Checker
 *  Re-render with errors and sticky values
 * ************************************** */
invValidate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classifications = await invModel.getClassifications() // for dropdown

    return res.status(400).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      errors: errors.array(),
      classifications,
      // Sticky values
      classification_id: req.body.classification_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_year: req.body.inv_year,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
    })
  }
  next()
}

module.exports = invValidate