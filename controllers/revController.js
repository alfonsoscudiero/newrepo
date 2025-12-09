// controllers/revController.js

// Import the review model so this controller can talk to the database
const reviewModel = require("../models/review-model")
// Create a controller object to hold our review-related functions
const revCont = {}

/* ****************************************
 *  Process New Review (POST /reviews/add)
 *  Called only when validation passes
 * *************************************** */
revCont.addReview = async function (req, res, next) {
  try {
    // Get the data that came from the review form (body of the POST)
    const { inv_id, account_id, review_text } = req.body 
    // Convert to Number inv_id and account_id
    const invId = Number(inv_id)
    const accountId = Number(account_id)

    // Insert the review into the database
    const addResult = await reviewModel.addReview(
      review_text,
      account_id,
      inv_id
    )

    // If insert failed, show a flash message and reload the details page
    if (!addResult) {
      req.flash("error", "Sorry, the review could not be added.")
      return res.redirect(`/inventory/detail/${inv_id}`)
    }
    // Success message
    req.flash("notice", "Your review was successfully posted!")
    // Redirect back to the vehicle detail page
    return res.redirect(`/inventory/detail/${inv_id}`)

  } catch (error) {
    // If something unexpected happens, pass the error to the global error handler
    next(error)
  }
}

// Export the controller object
module.exports = revCont