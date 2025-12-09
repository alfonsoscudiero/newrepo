// utilities/review-validation.js
// Server-side validation rules for reviews

const { body, validationResult } = require("express-validator")
const utilities = require("./")

const reviewValidate = {}

/* ******************************
 * Validation rules for add review
 * ****************************** */
reviewValidate.reviewRules = () => {
  return [
    body("review_text")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Please provide a review of at least 10 characters."),
    body("inv_id")
      .isInt({ min: 1 })
      .withMessage("A valid vehicle id is required."),
    body("account_id")
      .isInt({ min: 1 })
      .withMessage("A valid account id is required."),
  ]
}

/* ******************************
 * Check data and handle errors
 * ****************************** */
reviewValidate.checkReviewData = async (req, res, next) => {
  const errors = validationResult(req)

  // If validation errors exist
  if (!errors.isEmpty()) {
    const firstMsg = errors.array()[0].msg     
    const inv_id = req.body.inv_id  // vehicle ID from the form

    req.flash("error", firstMsg)  // store message for display
    return res.redirect(`/inv/detail/${inv_id}`) // controller will rebuild page
  }

  // No validation errors: continue to controller
  next()
}

module.exports = reviewValidate
