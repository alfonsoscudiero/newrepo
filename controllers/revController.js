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
  // Declare invIdOutside to use it in the catch block if needed
  let invIdOutside
  try {
    // Get the data that came from the review form (body of the POST)
    const { inv_id, account_id, review_text } = req.body 
    // Convert to Number inv_id and account_id
    const invId = Number(inv_id)
    const accountId = Number(account_id)
    invIdOutside = invId

    console.log("[CTRL] account_id from form:", account_id)
    console.log("[CTRL] inv_id from form:", inv_id)

    // Insert the review into the database
    const addResult = await reviewModel.addReview(
      review_text,      
      inv_id,
      account_id,
    )

    // If insert failed, show a flash message and reload the details page
    if (!addResult) {
      req.flash("error", "Sorry, the review could not be added.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }
    // Success message
    req.flash("notice", "Your review was successfully posted!")
    // Redirect back to the vehicle detail page
    return res.redirect(`/inv/detail/${inv_id}`)

  } catch (error) {
    // If something unexpected happens
    console.error("[CTRL] addReview error:", error)
    req.flash("error", "Something failed while posting your review.")  
    const safeInvId = invIdOutside || req.body.inv_id  
    return res.redirect(`/inv/detail/${safeInvId}`)
  }
}

// Export the controller object
module.exports = revCont