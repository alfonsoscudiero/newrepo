// routes/reviewRoute.js

// Inventory feature routes
const express = require("express")
const router = new express.Router()

// Controllers & Utilities
const utilities = require("../utilities")
const reviewController = require("../controllers/revController.js") 
const reviewValidate = require("../utilities/review-validation")

/* ****************************************
 * Process to add review
 * POST /reviews/add
 * Module 07 | Final Project
 **************************************** */
router.post(
  "/add",
  reviewValidate.reviewRules(),     // run validation rules
  reviewValidate.checkReviewData,   // check errors & possibly re-render
  utilities.handleErrors(reviewController.addReview) // if OK, actually insert into DB
)

/* ****************************************
 * Deliver the Edit Review form
 * GET /reviews/edit/:reviewId
 **************************************** */
router.get(
  "/edit/:reviewId",
  utilities.handleErrors(reviewController.buildEditReviewView)
)


/* ****************************************
 * Process the Edit Review form submission
 * POST /reviews/update
 **************************************** */
router.post(
  "/update",
  reviewValidate.updateReviewRules(),          // run validation rules on the review text
  reviewValidate.checkUpdateReviewData,  // handle validation errors for UPDATE form
  utilities.handleErrors(reviewController.updateReview) // actually perform DB update
)



/* ***************************
 *  Export the router so it can be used by server.js
 * ************************** */
module.exports = router