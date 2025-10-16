// controllers/invController.js

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
// invCont.buildVehicleDetail = async function (req, res, next) {
//   const inv_id = Number(req.params.inv_id) 

//   if (!Number.isInteger(inv_id)) {
//     return next({ status: 404, message: "Invalid vehicle Id." })
//   }

//   // 1. Query the database for the vehicle
//   const data = await invModel.getVehicleById(inv_id)

//   // If not found, forward to error handler
//   if (!data || data.length === 0) {
//     return next ({status: 404, message: "Vehicle not found."})
//   }

//   try {
//     // 3. Get navigation
//     const nav = await utilities.getNav()

//     // 4. Get vehicle data
//     const name = `${data.inv_year} ${data.inv_make} ${data.inv_model}`

//     // 5. Render the view
//     res.render("./inventory/detail", {
//       title: name,
//       nav,
//       name,
//       vehicle: data,
//     })
//   } catch (error) {
//       console.error("Error building vehicle detail:", error);
//       next(error);
//   }
// }


invCont.buildVehicleDetail = async function (req, res, next) {
  try {
    // Assignment 3 - Task 3 - Simulate a 500 error when requested
    // Example: /inv/detail/10?dev500=1
    if (req.query.dev500 === "1") {
      throw new Error("Task 3: forced 500");
    }
    // -------------------------------------------
    const inv_id_raw = req.params.inv_id;
    const inv_id = Number(inv_id_raw);

    console.log("[CTRL] buildVehicleDetail inv_id_raw =", inv_id_raw);

    if (!Number.isInteger(inv_id)) {
      console.warn("[CTRL] invalid inv_id");
      return next({ status: 404, message: "Invalid vehicle Id." });
    }

    // 1) Fetch the vehicle
    const vehicle = await invModel.getVehicleById(inv_id);

    if (!vehicle) {
      console.warn("[CTRL] vehicle not found for inv_id =", inv_id);
      return next({ status: 404, message: "Vehicle not found." });
    }

    // 2) Nav + computed fields
    const nav = await utilities.getNav();
    const name = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`;

    // Format price & miles
    const priceNumber = Number(vehicle.inv_price);
    const milesNumber = Number(vehicle.inv_miles);
    const priceFormatted = Number.isFinite(priceNumber)
      ? priceNumber.toLocaleString("en-US")
      : String(vehicle.inv_price);
    const milesFormatted = Number.isFinite(milesNumber)
      ? milesNumber.toLocaleString("en-US")
      : String(vehicle.inv_miles);

    console.log("[CTRL] rendering details for:", name);

    // 3) Render the view
    res.render("./inventory/details", {
      title: name,
      nav,
      name,
      vehicle,
      priceFormatted,
      milesFormatted,
    });
  } catch (error) {
    console.error("[CTRL] Error building vehicle detail:", error);
    next(error);
  }
};


// Export this controller so routes can call its functions
module.exports = {
  buildByClassificationId: invCont.buildByClassificationId,
  buildVehicleDetail: invCont.buildVehicleDetail,
}
