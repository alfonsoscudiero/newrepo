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
    const accountData = res.locals.accountData
    // Render the management page view
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      accountData,
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
 *  Renders the Register view. - Module 06 | Week 09
 *  views/account/register.ejs
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
 *  Process Registration - Module 06 | Week 09
 *  POST route for /account/register
 * **************************************** */
async function registerAccount(req, res) {
  // 1) Build the nav for the layout
  let nav = await utilities.getNav()
  // 2) Grab the form data from the request body
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body

  /* ****************************************
   *  Hash the password before saving it
   * **************************************** */
  let hashedPassword
  try {
    // Generate a secure hash of the password with 10 salt rounds.
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    console.error("[CTRL] registerAccount hash error:", error)
    // Message for the user if hashing fails
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    )
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  /* Insert the new account into the DB */
  let regResult
  try {
    regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  } catch (error) {
    console.error("[CTRL] registerAccount DB error:", error)
    req.flash(
      "notice",
      "Sorry, there was an error saving your account. Please try again."
    )
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  // DEBUG: show what the model returned
  // console.log(
  //   "register result -> type:",
  //   typeof regResult,
  //   "rowCount:",
  //   regResult?.rowCount
  // )

  // if (typeof regResult === "string") {
  //   console.log("register model error ->", regResult)
  // }

  /* ****************************************
   *  Handle success / failure
   * **************************************** */
  if (regResult && regResult.rowCount > 0) {
    // Success: flash a message using the user's first name
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    // Redirect to the normal login route.
    // That route will call buildLogin(), which renders the login view
    return res.status(201).redirect("/account/login")
  } else {
    // Insert failed (no rows affected)
    req.flash("notice", "Sorry, the registration failed.")
    return res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}
/* ****************************************
 *  Process Login request
 *  Module 06 - Week 09
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
/* ****************************************
 *  Logout controller
 *  GET /account/logout ***************************************** */
async function accountLogout(req, res, next) {
  try {
    // Clear the JWT cookie
    res.clearCookie("jwt")

    // Reset locals for this response
    res.locals.loggedin = 0
    res.locals.accountData = null

    // Optional flash message 
    req.flash("notice", "You have successfully logged out.")

    // Redirect to the homepage
    return res.redirect("/")
  } catch (error) {
    console.error("[CTRL] accountLogout error:", error)
    next(error)
  }
}
/* ****************************************
 *  Build Edit Account View
 *  GET /account/update/:account_id
 *  Module 06 | Week 10 Task 4 & 5
 * **************************************** */
async function buildUpdateAccount(req, res, next) {
  try {
    // Build the navigation for the layout
    const nav = await utilities.getNav()
    // Get the logged-in user's account data from res.locals
    const accountData = res.locals.accountData

    // Make sure the route id matches the logged-in account
    const routeAccountId = Number(req.params.account_id)
    if (!accountData || accountData.account_id !== routeAccountId) {
      req.flash("notice", "You are not authorized to edit that account.")
      return res.redirect("/account/")
    }

    // Render the "Edit Account" view with the current account data
    return res.render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,    // no validation errors yet on a GET
      accountData,     // used to pre-fill the form fields
    })
  } catch (error) {
    console.error("[CTRL] buildUpdateAccount error:", error)
    next(error)
  }
}
/* ****************************************
 *  Process Account Information Update
 *  POST /account/update
 *  Module 06 | Week 10 Task 4 & 5
 * **************************************** */
async function updateAccount(req, res, next) {
  // Pull the values from the form
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_id,
  } = req.body

  try {
    // Call the model to update the record in the database.
    const updateResult = await accountModel.updateAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_id
    )

    // If the update is successful
    if (updateResult) {
      /* ****************************************
       *  This ensures that the header will immediately show
       *  "Welcome NewName" without requiring a logout/login.
       * **************************************** */
      // Retrieve the updated account from the database
      const freshAccountData = await accountModel.getAccountById(account_id)

      if (freshAccountData) {
        // Remove the password before signing the token
        delete freshAccountData.account_password

        // Create a new JWT using the updated data
        const accessToken = jwt.sign(
          freshAccountData,
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: 3600 * 1000 }
        )

        // Store the new token in the cookie
        if (process.env.NODE_ENV === "development") {
          res.cookie("jwt", accessToken, {
            httpOnly: true,
            maxAge: 3600 * 1000,
          })
        } else {
          res.cookie("jwt", accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: 3600 * 1000,
          })
        }
      }

      req.flash("notice", "Account information updated successfully.")
      return res.redirect("/account/")
    }

    // If something went wrong re-render the form (but no thrown error)
    const nav = await utilities.getNav()
    const accountData = {
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    }
    req.flash("notice", "Sorry, the account information could not be updated.")
    return res.render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      accountData,
    })
  } catch (error) {
    console.error("[CTRL] updateAccount error:", error)
    next(error)
  }
}

/* ****************************************
 *  Process Password Update
 *  POST /account/update-password
 *  Module 06 | Week 10 Task 4 & 5
 * **************************************** */
async function updatePassword(req, res, next) {
  // Pull form values
  const { account_password, account_id } = req.body

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(account_password, 10)

    // Call the model to update the password in the database
    const updateResult = await accountModel.updatePassword(
      hashedPassword,
      account_id
    )

    // If the update succeeded
    if (updateResult) {
      req.flash("notice", "Password updated successfully.")
      return res.redirect("/account/")
    }

    // If update failed (no row updated)
    const nav = await utilities.getNav()
    const accountData = {
      account_id,
      // DO NOT return or prefill password
    }
    req.flash("notice", "Sorry, the password could not be updated.")
    return res.render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      accountData,
    })
  } catch (error) {
    console.error("[CTRL] updatePassword error:", error)
    next(error)
  }
}

// Export this controller so routes can call its functions
module.exports = {
  buildLogin, 
  processLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildAccountManagement,
  accountLogout,
  buildUpdateAccount,
  updateAccount,
  updatePassword,
}