// utilities/review-validation.js
// Required modules
const utilities = require(".")
const { body, validationResult } = require("express-validator")

// Models
const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")

// validation object
const reviewValidate = {}

/* ******************************
 * Review Form Validation Rules
 * ****************************** */
reviewValidate.reviewRules = () => {
  return [
    body("screen_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Screen name is required."),

    body("review_text")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please write a review.")
      .bail()
      .isLength({ min: 10 })
      .withMessage("Review must be at least 10 characters long."),
  ]
}

/* ******************************
 * Check review data and either
 * Re-render the vehicle details view with errors or 
 * continue to the controller to insert the review
 * ****************************** */
reviewValidate.checkReviewData = async (req, res, next) => {
  // Ask express-validator for any errors found by reviewRules()
  const errors = validationResult(req)

  // Check errors
  // If there are errors, rebuild vehicle details view with messages
  if (!errors.isEmpty()) {
    try {
      const nav = await utilities.getNav()
      const inv_id = Number(req.body.inv_id)

      // Get vehicle data + existing reviews to rebuild the page
      const vehicleData = await invModel.getVehicleByInvId(inv_id)
      const reviews = await reviewModel.getReviewsByInvId(inv_id)

      const vehicle = vehicleData[0]
      const title = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`

      const loggedin = res.locals.loggedin
      const accountData = res.locals.accountData || {}
      const accountId = accountData.account_id
      const screenName = utilities.buildScreenName(accountData)

      // Re-render the same vehicle details view, but showing the errors
      return res.render("inventory/details", {
        title,
        nav,
        vehicle,
        reviews,
        errors,        // express-validator errors
        loggedin,
        accountId,
        screenName,
        review_text: req.body.review_text, // sticky textarea value
      })
    } catch (err) {
      // If something unexpected happens, just pass the error to the global error handler
      return next(err)
    }
  }

  // If OK, continue to controller to insert the review
  next()
}

module.exports = reviewValidate