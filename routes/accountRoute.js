/* ***************************
 *  routes/accountRoute.js
Module 05 -Deliver login view    
 * ************************** */
const express = require("express"); //Bring in Express
const router = new express.Router(); //Create a new router instance

// Utilities & Controller
const utilities = require("../utilities/") //Import helper utilities
const accountController = require("../controllers/accountController") //Import the account controller

/* ***************************
 *  Deliver login view  
The base path "/account" will be added in server.js 
 * ************************** */
router.get("/login", utilities.handleErrors(accountController.buildLogin)) // use error handler + controller

// Export the router so it can be used by server.js
module.exports = router