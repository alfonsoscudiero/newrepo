// utilities/index.js
// Bring in the inventory model so we can access the database functions.
// We will use it here to get the list of all classifications.
const invModel = require("../models/inventory-model")

// JWT + dotenv for reading and verifying the token from cookies
const jwt = require("jsonwebtoken")
require("dotenv").config()

// Create an empty object to hold our utility functions.
// Right now, it will only contain getNav().
const Util = {}

/* ***************************************
 * getNav()
 * Builds (constructs) the HTML navigation menu.
 * It creates an unordered list (<ul>) with links
 * to the Home page and each vehicle classification.
 * ***************************************/
Util.getNav = async function (req, res, next) {
  // Get all classification data from the database
  let data = await invModel.getClassifications()

  // Start the unordered list (<ul>)
  let list = "<ul>"

  // Add the Home page link as the first list item
  list += '<li><a href="/" title="Home page">Home</a></li>'

  // Loop through each classification row returned from the database
  data.rows.forEach((row) => {
    // Start a new list item for this classification
    list += "<li>"

    // Build the hyperlink for that classification
    list +=
      '<a href="/inv/type/' +
      row.classification_id + // use the id in the URL
      '" title="See our inventory of ' +
      row.classification_name + // show tooltip text
      ' vehicles">' +
      row.classification_name + // visible link text
      "</a>"

    // Close the list item
    list += "</li>"
  })

  // Close the unordered list tag
  list += "</ul>"

  // Return the completed HTML string back to the controller
  return list
}

/* **************************************
* Build the classification view HTML
* - Receive an array of vehicles (data)
* - Build a <ul> list where each <li> shows a vehicle card:
*   image, name (make + model), price, and a link to its detail page
* - Return the final HTML string for the controller to render
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid // will hold the HTML to return

  if (data.length > 0){
    grid = '<ul id="inv-display">' // start the list

    // For each vehicle returned from the database, add a list item
    data.forEach(vehicle => { 
      grid += '<li>'

      // Clickable image: goes to the vehicle detail page by inv_id
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'

      // Name + Price section
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'

      // Clickable title: also goes to the vehicle detail page
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'

      grid += '</h2>'

      // Price formatted for US locale
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'

      grid += '</div>' // end .namePrice
      grid += '</li>'  // end one vehicle card
    })

    grid += '</ul>' // end the list
  } else { 
    // If no vehicles matched the classification, show a friendly message
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  // Return the HTML string to the controller so it can render the view
  return grid
}
/* ****************************************
 * AJAX Select Inventory - Module 06 | Week 09
 * ----------------------------------------
 * Builds an HTML <select> element listing ALL classifications.
 * The <select> has id="classificationList" so JavaScript can find it.
 * "classification_id" lets us pre-select one option
 * **************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  // Get classifications from the database
  const data = await invModel.getClassifications()
  // Start the <select> element.
  let select = '<select name="classification_id" id="classificationList">'
  select += '<option value="">Choose a Classification</option>'

  // Add each classification as an <option>
  data.rows.forEach((row) => {
    select += `<option value="${row.classification_id}"`
    // If a classification_id is provided, mark that option as selected (sticky)
    if (classification_id && row.classification_id == classification_id) {
      select += " selected"
    }

    select += `>${row.classification_name}</option>`
  })

  select += "</select>"

  return select
}
/* ****************************************
 * Middleware For Handling Errors
 * pass rejected Promises to Express error handling.
 * app.get("/", utilities.handleErrors(baseController.buildHome))
 **************************************** */
Util.handleErrors = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next) 
/* ****************************************
 * Middleware to check token validity - Module 06 | Week 09
 * - If a jwt cookie exists, verify it using ACESS_TOKEN_SECRET.
 * - If verification fails -> clear cookie, ask user to log in again.
 * - If verification succeeds -> put account data + loggedin flag in res.locals
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          console.error("[UTIL] checkJWTToken - verification failed:", err.message)
          req.flash("Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        // If successful, store the account data in res.locals
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        // Debug: show which user is logged in
        console.log(
          "[UTIL] checkJWTToken - token valid for:",
          accountData.account_firstname,
          accountData.account_email
        )
        next()
      }
    )
  } else {
    // No JWT cookie means the user is not logged in
    res.locals.loggedin = 0
    res.locals.accountData = null
    next()
  }
}
/* ****************************************
 * Middleware to protects the route - Module 06 | Week 09
 * - Blocks access if the user has no token
 * - It checks authorization
 **************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()  // allow access
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")  // If you are not logged in, you CANNOT see this page
  }
}

/* ****************************************
 * Export all utility functions
 * so controllers and server.js can use them.
 **************************************** */
module.exports = Util