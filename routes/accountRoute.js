/* ***************************
 *  routes/accountRoute.js
Module 05 -Deliver login view    
 * ************************** */
const express = require("express"); //Bring in Express
const router = new express.Router(); //Create a new router instance

// Utilities & Controller
const utilities = require("../utilities/") //Import helper utilities
const accountController = require("../controllers/accountController") //Import the account controller
const validate = require("../utilities/account-validation") // Import validation rules

/* ***************************
 *  Default account route - /account/
 *  Account management view after successful login   
 *  Module 06 | Week 09 
 * ************************** */
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)

/* ***************************
 *  Deliver login view  
The base path "/account" will be added in server.js 
 * ************************** */
router.get("/login", utilities.handleErrors(accountController.buildLogin)); // use error handler + controller

/* ***************************
// Process registration POST — this receives the form data from /account/login
 * ************************** */
router.post(
  "/login",
  validate.loginRules(),    // run validation checks
  validate.checkLoginData, // handle validation result
  utilities.handleErrors(accountController.accountLogin) //handles the logic and decides what to do next
)

/* ***************************
 *  Deliver Register view  
 * ************************** */
router.get("/register", utilities.handleErrors(accountController.buildRegister));

/* ***************************
// Process registration (POST) — 
// this receives the form data from /account/register
 * ************************** */
router.post(
  "/register",
  validate.registrationRules(),     // run validation checks
  validate.checkRegData,            // handle validation result
  utilities.handleErrors(accountController.registerAccount) // continue to controller
)

/* ***************************
 *  Export the router so it can be used by server.js
 * ************************** */
module.exports = router