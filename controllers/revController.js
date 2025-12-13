// controllers/revController.js

// Import the review model so this controller can talk to the database
const reviewModel = require("../models/review-model")
// Bring in shared utility functions (navigation builder, grid builder, etc.)
const utilities = require("../utilities/")
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

/* ****************************************
 *  Build Edit Review view (GET /reviews/edit/:review_id)
 * *************************************** */
revCont.buildEditReviewView = async function (req, res, next) {
  try {
    // Get reviewId from URL parameter and make sure it's a number
    const reviewId = Number(req.params.review_id)
    console.log("[CTRL] buildEditReviewView reviewId:", reviewId)

    if (!reviewId || Number.isNaN(reviewId)) {
      req.flash("error", "Invalid review id.")
      return res.redirect("/account/")
    }

    // Build the nav for the layout
    const nav = await utilities.getNav()

    // Get the review data from the database
    const reviewData = await reviewModel.getReviewById(reviewId)
    console.log("[CTRL] buildEditReviewView reviewData:", reviewData)

    // If no review was found, redirect back to account management
    if (!reviewData) {
      req.flash("error", "The requested review could not be found.")
      return res.redirect("/account/")
    }

    // Verify that the logged-in user owns this review
    const accountData = res.locals.accountData
    if (accountData && accountData.account_id !== reviewData.account_id) {
      req.flash("error", "You are not authorized to edit this review.")
      return res.redirect("/account/")
    }

    // Prepare a friendly name and formatted date for the view
    const itemName = `${reviewData.inv_year} ${reviewData.inv_make} ${reviewData.inv_model}`
    const formattedDate = utilities.formatReviewDate(reviewData.review_date)

    // Render the Edit Review page with existing data
    return res.render("review/edit", {
      title: `Edit ${itemName} Review`,
      nav,
      errors: null,  // no validation errors on initial GET
      review_id: reviewData.review_id, // hidden field in the form
      review_date: formattedDate, // read-only date field
      review_text: reviewData.review_text, // textarea pre-filled with current text
    })
  } catch (error) {
    console.error("[CTRL] buildEditReviewView error:", error)
    // Let the global error handler take care of this
    return next(error)
  }
}

/* ****************************************
 *  Process Update Review (POST /reviews/update)
 * *************************************** */
revCont.updateReview = async function (req, res, next) {
  let reviewIdOutside

  try {
    // Get data that came from the Edit Review form
    const { review_id, review_text } = req.body
    const reviewId = Number(review_id)
    reviewIdOutside = reviewId

    console.log("[CTRL] updateReview review_id from form:", review_id)
    console.log("[CTRL] updateReview new review_text:", review_text)

    // If reviewId is missing or NaN
    if (!reviewId || Number.isNaN(reviewId)) {
      req.flash("error", "Invalid review id.")
      return res.redirect("/account/")
    }

    // Call the model to update the review in the database
    const updateResult = await reviewModel.updateReview(reviewId, review_text)

    // If the update failed (no rows affected), inform the user
    if (!updateResult) {
      req.flash(
        "error",
        "Sorry, the review could not be updated. Please try again."
      )
      return res.redirect("/account/")
    }

    // Success path
    req.flash("notice", "Your review was successfully updated.")
    return res.redirect("/account/")
  } catch (error) {
    // Handle unexpected errors
    console.error("[CTRL] updateReview error:", error)
    req.flash(
      "error",
      "An unexpected error occurred while updating your review."
    )
    // Even on error, send them back to Account Management
    return res.redirect("/account/")
  }
}

/* ****************************************
 *  Build delete review view (GET /reviews/delete/:review_id)
 * *************************************** */
revCont.buildDeleteReviewView = async function (req, res, next) {
  try {
    // Get reviewId from URL parameter and make sure it's a number
    const reviewId = Number(req.params.review_id)
    console.log("[CTRL] buildDeleteReviewView reviewId:", reviewId)

    if (!reviewId || Number.isNaN(reviewId)) {
      req.flash("error", "Invalid review id.")
      return res.redirect("/account/")
    }

    // Build the nav for the layout
    const nav = await utilities.getNav()

    // Get the review data from the database
    const reviewData = await reviewModel.getReviewById(reviewId)
    console.log("[CTRL] buildDeleteReviewView reviewData:", reviewData)

    // If no review was found, redirect back to account management
    if (!reviewData) {
      req.flash("error", "The requested review could not be found.")
      return res.redirect("/account/")
    }

    // Verify that the logged-in user owns this review
    const accountData = res.locals.accountData
    if (accountData && accountData.account_id !== reviewData.account_id) {
      req.flash("error", "You are not authorized to delete this review.")
      return res.redirect("/account/")
    }

    // Prepare a friendly name and formatted date for the view
    const itemName = `${reviewData.inv_year} ${reviewData.inv_make} ${reviewData.inv_model}`
    const formattedDate = utilities.formatReviewDate(reviewData.review_date)

    // Render the Delete Review page with existing data
    return res.render("review/delete", {
      title: `Delete ${itemName} Review`,
      nav,
      review_id: reviewData.review_id, // hidden field in the form
      review_date: formattedDate, // read-only date field
      review_text: reviewData.review_text, // textarea pre-filled with current text
    })
  } catch (error) {
    console.error("[CTRL] buildDeleteReviewView error:", error)
    // Let the global error handler take care of this
    return next(error)
  }
}

/* ****************************************
 *  Process Delete Review (POST /reviews/delete)
 * *************************************** */
revCont.deleteReview = async function (req, res, next) {
  try {
    // Get data that came from the Edit Review form
    const { review_id } = req.body
    const reviewId = Number(review_id)

    console.log("[CTRL] deleteReview review_id from form:", review_id)

    // If reviewId is missing or NaN
    if (!reviewId || Number.isNaN(reviewId)) {
      req.flash("error", "Invalid review id.")
      return res.redirect("/account/")
    }
    // Check if user is logged-in
    const accountData = res.locals.accountData
    if (!accountData) {
      req.flash("error", "You must be logged in to delete a review.")
      return res.redirect("/account/login")
    }

    // Fetch the review  + confirm ownership
      const reviewData = await reviewModel.getReviewById(reviewId)
      if (!reviewData) {
        req.flash("error", "The requested review could not be found.")
        return res.redirect("/account/")
      }
      if (accountData.account_id !== reviewData.account_id) {
        req.flash("error", "You are not authorized to delete this review.")
        return res.redirect("/account/")
      }

    // Delete Review based on IDs
    const deleteResult = await reviewModel.deleteReview(reviewId, accountData.account_id)
    // If the delete failed (no rows affected), inform the user
    if (!deleteResult) {
      req.flash(
        "error",
        "Sorry, the review could not be deleted. Please try again."
      )
      return res.redirect("/account/")
    }
    // Success path
    req.flash("notice", `Your review for vehicle #${deleteResult.inv_id} was successfully deleted.`)
    return res.redirect("/account/")
  } catch (error) {
    // Handle unexpected errors
    console.error("[CTRL] deleteReview error:", error)
    req.flash(
      "error",
      "An unexpected error occurred while deleting your review."
    )
    // Even on error, send them back to Account Management
    return res.redirect("/account/")
  }
}

// Export the controller object
module.exports = revCont