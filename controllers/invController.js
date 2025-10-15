// Bring in the data access model (inventory-model) to query the database
const invModel = require("../models/inventory-model")
// Bring in shared utility functions (navigation builder, grid builder, etc.)
const utilities = require("../utilities/")

// Create a controller object to hold related functions
const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  // 1) Get the id from the route, supporting either :classificationId or :id
  const rawId = req.params.classificationId ?? req.params.id  
  const classification_id = Number(rawId) 

  // If the param is missing or not a number, treat as not found
  if (!Number.isInteger(classification_id)) {
    return next({ status: 404, message: "Invalid classification id." })
  }

  // 2) Query the database for vehicles in this classification
  const data = await invModel.getInventoryByClassificationId(classification_id)

  // Guard: if no rows, forward a 404 to the global error handler
  if (!data || data.length === 0) {
    return next({
      status: 404,
      message: "No inventory found for that classification.",
    }) 
  }

  // 3) Build grid + nav
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()

  // 4) Read the classification's display name from the first row of data
  const className = data[0].classification_name

  // Render the view back to the browser
  //    - title: dynamic (e.g., "SUV vehicles")
  //    - nav: the menu
  //    - grid: the list of vehicles for this classification
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build single vehicle detail view
 * ************************** */
invCont.buildVehicleDetail = async function (req, res, next) {
  const invId = Number(req.params.invId) 

  if (!Number.isInteger(invId)) {
    return next({ status: 404, message: "Invalid vehicle Id." })
  }

  // 1. Query the database for the vehicle
  const data = await invModel.getVehicleById(invId)

  // If not found, forward to error handler
  if (!data || data.length === 0) {
    return next ({status: 404, message: "Vehicle not found."})
  }

  // 3. Get navigation
  const nav = await utilities.getNav()

  // 4. Get vehicle data
  const item = data[0]
  const name = `${item.inv_year} ${item.inv_make} ${item.inv_model}`

  // 5. Render the view
  res.render("./inventory/detail", {
    title: name,
    nav,
    name,
    vehicle: item,
  })
}

// Export this controller so routes can call its functions
module.exports = {
  buildByClassificationId: invCont.buildByClassificationId,
  buildVehicleDetail: invCont.buildVehicleDetail,
}
