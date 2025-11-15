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
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
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
/* ******************************
 * Build Delete Confirmation View
 * Module 06 - Week 09 | Delete Inventory DB
 ****************************** */
invCont.deleteView = async function (req, res, next) {
  try {
    // Read and validate the id from the URL
    const inv_id = parseInt(req.params.inv_id)
    if (!Number.isInteger(inv_id)) {
      throw new Error("Invalid vehicle id.")
    }

    // Build navigation for the layout
    const nav = await utilities.getNav()

    // Get this specific vehicle from the model
    const itemData = await invModel.getVehicleById(inv_id)

    // Friendly name for the page title
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    // Render delete-confirm.ejs with read-only data
    return res.render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    })
  } catch (error) {
    console.error("[CTRL] deleteView error:", error)
    next(error)
  }
}
/* ******************************
 * Delete Inventory Item (POST)
 *Module 06 - Week 09 | Delete Inventory DB
 ****************************** */
invCont.deleteItem = async function (req, res, next) {
  try {
    // Read id from hidden input in the form body
    const inv_id = parseInt(req.body.inv_id)
    if (!Number.isInteger(inv_id)) {
      throw new Error("Invalid vehicle id.")
    }

    // Ask the model to delete this record
    const deleteResult = await invModel.deleteInventoryItem(inv_id)

    // If the delete worked, go back to management with success message
    if (deleteResult) {
      req.flash("notice", "The deletion was successful.")
      return res.redirect("/inv/")
    }

    // If it failed, send user back to the delete page
    req.flash("notice", "Sorry, the delete failed.")
    return res.redirect(`/inv/delete/${inv_id}`)
  } catch (error) {
    console.error("[CTRL] deleteItem error:", error)
    next(error)
  }
}

// Export this controller so routes can call its functions
module.exports = {
  buildByClassificationId: invCont.buildByClassificationId,
  buildVehicleDetail: invCont.buildVehicleDetail,
  buildManagementView: invCont.buildManagementView, 
  buildAddClassification: invCont.buildAddClassification, //GET
  addClassification: invCont.addClassification, //POST
  buildAddInventory: invCont.buildAddInventory, //GET
  addInventory: invCont.addInventory, // POST
  getInventoryJSON: invCont.getInventoryJSON,
  buildEditInventory: invCont.buildEditInventory, // GET
  deleteView: invCont.deleteView,  // GET
  deleteItem: invCont.deleteItem,   // POST
}