// controllers/invController.js

// Bring in the data access model (inventory-model) to query the database
const invModel = require("../models/inventory-model")
// Bring in shared utility functions (navigation builder, grid builder, etc.)
const utilities = require("../utilities/")

// Create a controller object to hold related functions
const invCont = {}

/* *******************************************************
 * Build the Vehicle Management view  (Assignment 04)
 * Route: /inv/
 * ******************************************************* */
invCont.buildManagementView = async function (req, res) {
  try {
    // 1) Build the nav menu (Home + Classifications)
    const nav = await utilities.getNav()

    // 2) Render the management page view
    res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
    })
  } catch (error) {
    console.error("[CTRL] Error building management view:", error)
    res.status(500).send("Server error while loading management page")
  }
}

/* *******************************************************
 * Build inventory by classification view
 * Route example: /inv/type/:classificationId
 * ******************************************************* */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    // 1) Get the id from the route
    const rawId = req.params.classificationId ?? req.params.id
    const classification_id = Number(rawId)

    console.log("[CTRL] buildByClassificationId -> classificationId:", classification_id)

    if (!Number.isInteger(classification_id)) {
      return next({ status: 404, message: "Invalid classification id." })
    }

    // 2) Query the database for vehicles in this classification
    const data = await invModel.getInventoryByClassificationId(classification_id)
    console.log("[CTRL] rows returned:", Array.isArray(data) ? data.length : 0)

    // Guard: if no rows, forward a 404
    if (!data || data.length === 0) {
      return next({
        status: 404,
        message: "No inventory found for that classification.",
      })
    }

    // 3) Build grid + nav
    const grid = await utilities.buildClassificationGrid(data)
    const nav = await utilities.getNav()

    // 4) Pull the readable classification name
    const className = data[0].classification_name

    // 5) Render the view
    res.render("inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      data, 
    })
  } catch (err) {
    console.error("[CTRL] buildByClassificationId error:", err)
    next(err)
  }
}

/* *******************************************************
 * Build single vehicle detail view
 * Route example: /inv/detail/:inv_id
 * ******************************************************* */
invCont.buildVehicleDetail = async function (req, res, next) {
  try {
    const inv_id_raw = req.params.inv_id
    const inv_id = Number(inv_id_raw)

    console.log("[CTRL] buildVehicleDetail inv_id_raw =", inv_id_raw)

    if (!Number.isInteger(inv_id)) {
      return next({ status: 404, message: "Invalid vehicle Id." })
    }

    // 1) Fetch the vehicle
    const vehicle = await invModel.getVehicleById(inv_id)

    // ====== Assignment 3 intentional 500 for footer link ======
    // If the footer points to /inv/detail/99 (non-existent),
    // we intentionally throw a 500 to demonstrate the global handler.
    if (!vehicle) {
      console.warn("[CTRL] vehicle not found for inv_id =", inv_id)
      if (inv_id === 99) {
        throw new Error("Intentional 500 error triggered by Assignment 3 link")
      }
      // Otherwise behave correctly with a 404
      return next({ status: 404, message: "Vehicle not found." })
    }
    // ====================================================================

    // 2) Nav + computed fields
    const nav = await utilities.getNav()
    const name = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`

    // Format price & miles for display
    const priceNumber = Number(vehicle.inv_price)
    const milesNumber = Number(vehicle.inv_miles)
    const priceFormatted = Number.isFinite(priceNumber)
      ? priceNumber.toLocaleString("en-US")
      : String(vehicle.inv_price)
    const milesFormatted = Number.isFinite(milesNumber)
      ? milesNumber.toLocaleString("en-US")
      : String(vehicle.inv_miles)

    console.log("[CTRL] rendering details for:", name)

    // 3) Render the view
    res.render("inventory/details", {
      title: name,
      nav,
      name,
      vehicle,
      priceFormatted,
      milesFormatted,
    })
  } catch (error) {
    console.error("[CTRL] Error building vehicle detail:", error)
    next(error)
  }
}



// Export this controller so routes can call its functions
module.exports = {
  buildByClassificationId: invCont.buildByClassificationId,
  buildVehicleDetail: invCont.buildVehicleDetail,
  buildManagementView: invCont.buildManagementView, 
}
