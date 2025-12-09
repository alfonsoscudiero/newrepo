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

/* ***************************
 *  Export the router so it can be used by server.js
 * ************************** */
module.exports = router