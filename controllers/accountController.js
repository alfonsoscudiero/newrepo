/* ***************************
 *  controllers/accountController.js
Module 05   
 * ************************** */
// Import utilities to build the nav bar, error handling, etc.
const utilities = require("../utilities");
// controllers/accountController.js
const accountModel = require("../models/account-model") // model to save account data
// bcryptjs for password hashing
const bcrypt = require("bcryptjs")
// Add JWT for authentication
const jwt = require("jsonwebtoken")    
require("dotenv").config()  

/* ****************************************
 *  Account Management View
 *  GET /account/
 *  Shows the "You're logged in." page
 * **************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    let nav = await utilities.getNav()
    // Render the management page view
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
    })
  } catch (error) {
    // Debugging
    console.error("[CTRL] Error building account management view", error)
    next(error)
  }
}

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
    errors: null,         
    account_email: "",    
  })
}

/* ****************************************
 *  Process Login (POST /account/login)
 *  It confirms that server validation passed and
 *  re-renders the login page. 
 * **************************************** */
async function processLogin(req, res) {
  let nav = await utilities.getNav()
  // Show a flash message to verify that server validation 
  // and POST routing are working
  req.flash(
    "notice",
    "Login POST reached. Server-side validation passed."
  )
  // Render login view
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: req.body.account_email,
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

/* ****************************************
 *  Hash the password before storing in the DB
 * **************************************** */
  let hashedPassword
  try {
    // Generate a secure hash of the password with 10 salt rounds.
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    // If an error occurs while hashing, show a user-friendly message.
    req.flash("notice", "Sorry, there was an error processing the registration.")
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  // Insert the new account using the hashed password
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  // Always show basic shape - Debug
  // console.log("register result -> type:", typeof regResult, "rowCount:", regResult?.rowCount)
  // If the model returned an error message string, print it so we know the cause
  // if (typeof regResult === "string") {
  //   console.log("register model error ->", regResult)
  // }

  // Handle success/failure directly
  if (regResult && regResult.rowCount > 0) {
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

/* ****************************************
 *  Process Login request
 *  Module 06
 * **************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("[CTRL] AccountLogin error:", error)
    throw new Error('Access Forbidden')
  }
}

//Export controller functions to be used in routes
module.exports = { buildLogin, processLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement }