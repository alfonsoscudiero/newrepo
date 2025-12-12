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

/* ******************************
 * Validation rules for update review
 * ****************************** */
reviewValidate.updateReviewRules = () => {
  return [
    body("review_text")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Please provide a review of at least 10 characters."),
    body("review_id")
      .isInt({ min: 1 })
      .withMessage("A valid review id is required.")
  ]
}

/* ******************************
 * Check data for updating review
 * ****************************** */
reviewValidate.checkUpdateReviewData = async (req, res, next) => {
  const errors = validationResult(req)
  const { review_id, review_text } = req.body
  // If there are validation errors, rebuild the edit view
  if (!errors.isEmpty()) {
    try {
      // Build nav for layout
      const nav = await utilities.getNav()
      // Get current review info from the DB
      const reviewData = await reviewModel.getReviewById(review_id)
      // If for some reason the review does not exist, send user back to account
      if (!reviewData) {
        req.flash("error", "The requested review could not be found.")
        return res.redirect("/account/")
      }
      // Format the stored review date for display
      const formattedDate = utilities.formatReviewDate(reviewData.review_date)

      const itemName = `${reviewData.inv_make} ${reviewData.inv_model}`

      // Render the Edit Review page again with errors and sticky data
      return res.render("review/edit", {
        title: `Edit ${itemName} Review`,
        nav,
        errors: errors.array(), // express-validator error list
        review_id,
        review_date: formattedDate,
        review_text, // sticky review
      })
    } catch (error) {
      console.log("[UTIL] checkUpdateReviewData error:", error )
      // If something fails here, pass to global error handler
      return next(error)
    }
  }

  // No validation errors
  next()
}

module.exports = reviewValidate
