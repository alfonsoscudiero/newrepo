/* ***************************
 *  controllers/accountController.js
Module 05   
 * ************************** */
// Import utilities to build the nav bar, error handling, etc.
const utilities = require("../utilities");

/* ****************************************
 *  Deliver login view
 *  Render the login page at GET /account/login
 *  title: used by <title> and <h1>
 *  nav: HTML for the site navigation (built by utilities.getNav())
 * **************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", { //Render the view located at views/account/login.ejs
    title: "Login",
    nav,
  })
}
/* ****************************************
 * buildRegister
 * Renders the Register view.
 * - No DB calls; just render the EJS template with a title.
 * - Keep the view path consistent with folder structure: "views/account/register.ejs"
 * **************************************** */
async function buildRegister(req, res, next) {
  // Render the "account/register" view and pass a simple title variable.
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  });
}


//Export controller functions to be used in routes
module.exports = { buildLogin, buildRegister }