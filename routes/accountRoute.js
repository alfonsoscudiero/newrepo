/* ***************************
 *  routes/accountRoute.js
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
 *  Logout route
 *  GET /account/logout
 *  - Module 06 | Week 10 Task 1
 * ************************** */
router.get(
  "/logout",
  utilities.handleErrors(accountController.accountLogout)
)

/* ***************************
 *  Build Edit Account View
 *  GET /account/update/:account_id
 *  Module 06 | Week 10 Task 4 & 5
 * ************************** */
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
)

/* ***************************
 *  Process Account Info Update
 *  POST /account/update
 *  Module 06 | Week 10 Task 4 & 5
 * ************************** */
router.post(
  "/update",
  validate.updateAccountRules(), // validate new name + email
  validate.checkUpdateAccountData, // handle validation errors
  utilities.checkLogin, // ensure user is still logged in
  utilities.handleErrors(accountController.updateAccount) // controller to update DB
)

/* ***************************
 *  Process Password Change
 *  POST /account/update-password
 *  Module 06 | Week 10 Task 4 & 5
 * ************************** */
router.post(
  "/update-password",
  validate.updatePasswordRules(), // validate new password
  validate.checkUpdatePasswordData, // handle validation errors
  utilities.checkLogin, // ensure user is still logged in
  utilities.handleErrors(accountController.updatePassword) // controller to update password
)


/* ***************************
 *  Export the router so it can be used by server.js
 * ************************** */
module.exports = router