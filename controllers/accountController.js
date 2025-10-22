/* ***************************
 *  controllers/accountController.js
Module 05   
 * ************************** */
// Import utilities to build the nav bar, error handling, etc.
const utilities = require("../utilities");

// controllers/accountController.js
const accountModel = require("../models/account-model") // model to save account data


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
  //  Fetch the navigation HTML before rendering
  let nav = await utilities.getNav();
  // Render the "account/register" view and pass a simple title variable.
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  });
}

/* ****************************************
 *  Process Registration
 *  POST route for /account/register
 * **************************************** */
async function registerAccount(req, res) {
  // Build navigation for the layout
  let nav = await utilities.getNav()

  // Extract data from the form fields
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Send the data to the account model to insert into the DB
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  // Handle success/failure directly
  if (regResult) {
    // Flash success message using the user's first name
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    // Render login view after successful registration
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    // Flash message on registration failure
    req.flash("notice", "Sorry, the registration failed.")
    // Re-render the registration page so the user can try again
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

//Export controller functions to be used in routes
module.exports = { buildLogin, buildRegister, registerAccount }