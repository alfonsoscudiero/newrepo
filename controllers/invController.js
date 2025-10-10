// Bring in the data access model (inventory-model) to query the database
const invModel = require("../models/inventory-model")
// Bring in shared utility functions (navigation builder, grid builder, etc.)
const utilities = require("../utilities/")

// Create a controller object to hold related functions
const invCont = {}

/* ***************************
 *  Build inventory by classification view
 *  What this does in plain English:
 *  1) Read the classificationId from the URL (e.g., /inv/type/2)
 *  2) Ask the model for all vehicles in that classification
 *  3) Turn the vehicles into an HTML grid (cards list)
 *  4) Build the navigation menu
 *  5) Render the "classification" view with title, nav, and grid
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  // 1) Get the classification id from the URL parameter named ":classificationId"
  const classification_id = req.params.classificationId

  // 2) Query the database for vehicles that belong to this classification
  const data = await invModel.getInventoryByClassificationId(classification_id)

  // 3) Build an HTML grid (string) for the vehicles returned
  const grid = await utilities.buildClassificationGrid(data)

  // 4) Build the site navigation (top menu) as HTML
  let nav = await utilities.getNav()

  // 5) Read the classification's display name from the first row of data
  //    (Assumes there is at least one vehicle. If no vehicles are returned for this classification_id, data[0] will be undefined and this line will throw an error.)
  const className = data[0].classification_name

  // 6) Send the fully-formed view back to the browser
  //    - title: dynamic (e.g., "SUV vehicles")
  //    - nav: the menu
  //    - grid: the list of vehicles for this classification
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

// Export this controller so routes can call its functions
module.exports = invCont
