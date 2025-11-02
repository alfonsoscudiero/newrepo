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
invCont.buildManagementView = async function (req, res, next) {
  try {
    // 1) Build the nav menu (Home + Classifications)
    const nav = await utilities.getNav()

    // 2) Render the management page view
    res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
    })
  } catch (error) {
    // Log the error for debugging
    console.error("[CTRL] Error building management view:", error)
    // Pass to global error handler
    next(error)
  }
}

/* *******************************************************
 * Build inventory by classification view
 * Route example: /inv/type/:classificationId
 * **************************************************** */
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
 ******************************************************** */
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

/* *******************************************************
 * Build Add Classification form view (Assignment 04 - Task 2)
 * Route: /inv/add-classification  (GET)
 * ************************************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()

    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      // Provide defaults so the view can be 'sticky' after errors
      errors: null,
      classification_name: "",
    })
  } catch (error) {
    console.error("[CTRL] Error delivering Add Classification view:", error)
    next(error)
  }
}

/* *******************************************************
 * Process Add Classification (POST)
 * Route: /inv/add-classification
 * Validation has already run
 * ************************************************** 
 * */
invCont.addClassification = async function (req, res, next) {
  // 1) Build navigation for the layout
  let nav = await utilities.getNav()
  // 2) Extract data from the new classification form
  const { classification_name } = req.body
  console.log("[CTRL] addClassification:", classification_name)

  try {
    // 3) Insert the new classification
    const inserted = await invModel.addClassification(classification_name)
    console.log("[CTRL] addClassification -> inserted:", inserted)
    // Success message
    req.flash("notice", `The classification "${classification_name}" was successfully added.`)
    // Redirect to the inventory management page
    res.redirect("/inv")
  } catch (error) {
    console.error("[CTRL] Error adding classification:", error)
    // If an error occurs
    req.flash("notice", "Sorry, there was an error adding the classification.")
    return res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name, 
    })
  }
}

/* *******************************************************
 * Build Add Inventory form view (Assignment 04 - Task 3)
 * Route: /inv/add-inventory  (GET)
 * ************************************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    // Build navigation for layout
    const nav = await utilities.getNav()

    // Fetch classifications from the DB for the dropdown
    let classifications = []
    // Check if the function exists before calling it
    if (typeof invModel.getClassifications === "function") {
      classifications = await invModel.getClassifications()
    }

    // Render view with sticky defaults and an empty error state
    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      errors: null,
      // Dropdown data
      classifications,      
      // Sticky defaults for inputs (match your EJS name attributes)
      classification_id: "",
      inv_make: "",
      inv_model: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_price: "",
      inv_year: "",
      inv_miles: "",
      inv_color: "",
    })
  } catch (err) {
    console.error("[CTRL] buildAddInventory error:", err);
    // If an error occurs
    next(err)
  }
}

/* *******************************************************
 * Build Add Inventory form view (Assignment 04 - Task 3)
 * Route: /inv/add-inventory  (POST)
 * Validation has already run 
 * ************************************************** */
invCont.addInventory = async function (req, res, next) {  
  try {
    // Build navigation for layout
    const nav = await utilities.getNav()
    // Destructure validated fields from req.body
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    } = req.body

    // Log what was received from the form
    console.log("[CTRL] Received form data - addInventory:")
    console.table(req.body)

    // Ensure image paths aren’t empty
    const imagePath =
      inv_image && String(inv_image).trim() !== ""
        ? inv_image
        : "/images/vehicles/no-image.png"

    const thumbPath =
      inv_thumbnail && String(inv_thumbnail).trim() !== ""
        ? inv_thumbnail
        : "/images/vehicles/no-image-tn.png"

    // Log final payload to be inserted
    console.log("[CTRL:addInventory] Final insert payload:", {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      inv_image: imagePath,
      inv_thumbnail: thumbPath,
    })

    // Insert into the database via model
    const result = await invModel.addInventory(
      inv_make,
      inv_model,
      inv_description,
      imagePath,
      thumbPath,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    )

    // Log the DB result for debugging
    console.log("[CTRL:addInventory] DB insert result:", result)

    // On success, flash message and redirect
    req.flash("notice", "The vehicle was successfully added.")
    res.redirect("/inv")
  } catch (error) {
    console.error("[CTRL:addInventory] Error:", error)

    // Rebuild classification dropdown if an error occurs
    let classifications = []
    try {
      if (typeof invModel.getClassifications === "function") {
        classifications = await invModel.getClassifications()
      }
    } catch (e) {
      console.warn("[CTRL] Could not reload classifications:", e)
    }

    const nav = await utilities.getNav()
    // Render form again with sticky values for user convenience
    return res.status(500).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      errors: null,
      classifications,
      ...req.body,
    })
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
}