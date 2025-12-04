// controllers/invController.js

// Bring in the data access model (inventory-model) to query the database
const invModel = require("../models/inventory-model")
// Bring in shared utility functions (navigation builder, grid builder, etc.)
const utilities = require("../utilities/")
// Review model to fetch reviews for a vehicle | Final Project
const reviewModel = require ("../models/review-model")
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

    // ================================
    // AJAX Select Inventory - Module 06 | Week 09
    // This will be used by the client-side JavaScript to fetch inventory via AJAX.
    // ================================
    const classificationSelect = await utilities.buildClassificationList()    

    // 2) Render the management page view
    res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classificationSelect, // AJAX Select Inventory
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

    // console.log("[CTRL] buildByClassificationId -> classificationId:", classification_id)

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

    // console.log("[CTRL] buildVehicleDetail inv_id_raw =", inv_id_raw)

    if (!Number.isInteger(inv_id)) {
      return next({ status: 404, message: "Invalid vehicle Id." })
    }

    // Fetch the vehicle
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

    // Fetch reviews for this vehicle
    let reviews = [];
    try {
      // Ask review model for this car's reviews
      reviews = await reviewModel.getReviewsByInvId(inv_id)
      
      // Apply fromatting to each review
      reviews = reviews.map(r => {
        return {
          ...r,
          review_screenname: utilities.buildScreenName(r.account_firstname, r.account_lastname),
          review_date_formatted: utilities.formatReviewDate(r.review_date)
        }
      })

    } catch (reviewErr) {
        console.error("[CTRL] Error fetching reviews:", reviewErr);
        reviews = [];
    }
    // Ensure we always work with an array
    reviews = Array.isArray(reviews) ? reviews : []

    // Sort newest first by review_date
    reviews.sort((a, b) => new Date(b.review_date) - new Date(a.review_date))

    // Convenience flag for the EJS view
    const hasReviews = reviews.length > 0

    // Nav + computed fields
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

    // console.log("[CTRL] rendering details for:", name)

    const loggedin = res.locals.loggedin || false // Boolean if the user is logged in
    const accountData = res.locals.accountData || null // user info for the review form
    const accountId = accountData ? accountData.account_id : null 
    // Build screen name from account data (first name + last name)
    let screenName = ""
    if (accountData) {
      screenName = utilities.buildScreenName(
        accountData.account_firstname,
        accountData.account_lastname
      )
    }

    // Render the view
    res.render("inventory/details", {
      title: name,
      nav,
      name,
      vehicle,
      priceFormatted,
      milesFormatted,
      // Data sent to the EJS view
      reviews, // Array of reviews (newest first)
      hasReviews, // Boolean if the vehicle has reviews or “no reviews” message
      loggedin, // Toggle between login prompt vs form
      accountId, // for hidden <input> in the review form
      inv_id, // know which vehicle this review belongs to
      screenName,
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
  // console.log("[CTRL] addClassification:", classification_name)

  try {
    // 3) Insert the new classification
    const inserted = await invModel.addClassification(classification_name)
    // console.log("[CTRL] addClassification -> inserted:", inserted)
    // Success message
    req.flash("notice", `The classification "${classification_name}" was successfully added.`)
    // Redirect to the inventory management page
    res.redirect("/inv")
  } catch (error) {
    // console.error("[CTRL] Error adding classification:", error)
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
  // console.log("[CTRL:addInventory] Ran with body:", req.body);  
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
    // console.log("[CTRL] Received form data - addInventory:")
    // console.table(req.body)

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
    // console.log("[CTRL:addInventory] Final insert payload:", {
    //   classification_id,
    //   inv_make,
    //   inv_model,
    //   inv_description,
    //   inv_price,
    //   inv_year,
    //   inv_miles,
    //   inv_color,
    //   inv_image: imagePath,
    //   inv_thumbnail: thumbPath,
    // })

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
    // console.log("[CTRL:addInventory] DB insert result:", result)

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
      console.error("[CTRL] Could not reload classifications:", e)
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
/* ****************************************
 * Return Inventory by Classification As JSON
 * Used by AJAX fetch in inventory.js
 **************************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    // 1. Get the classification_id from the URL
    const classification_id = parseInt(req.params.classification_id)
    // console.log("[CTRL:getInventoryJSON] classification_id:", classification_id)

    // 2. Ask the model for all vehicles in that classification
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    // console.log("[CTRL:getInventoryJSON] invData from model:", invData)

    // 3. If we got an array with at least one vehicle, return it as JSON
    if (Array.isArray(invData) && invData.length > 0) {
      return res.json(invData)
    }

    // 4. If nothing came back, return an empty array (NOT a crash)
    // This avoids 500 errors and still keeps the frontend happy.
    return res.json([])

  } catch (error) {
    console.error("[CTRL:getInventoryJSON] Error:", error)
    next(error) // let Express error handler deal with it
  }
}
/* ******************************
 * Build Edit Inventory View - GET
 * Module 06 | Week 09
 ****************************** */
invCont.buildEditInventory = async function (req, res, next) {
  try {
    // 1) Read the inventory id from the URL parameter
    const inv_id = parseInt(req.params.inv_id)
    console.log("[CTRL] buildEditInventory -> inv_id =", inv_id)

    // Validate inv_id 
    if (!Number.isInteger(inv_id)) {
      throw new Error("Invalid vehicle id.")
    }

    // 2) Build navigation for layout
    const nav = await utilities.getNav()

    // 3) Ask the model for this specific vehicle
    const itemData = await invModel.getVehicleById(inv_id)

    // If nothing came back, throw error
    if (!itemData) {
      throw new Error("No data returned for inventory item with id " + inv_id)
    }

    // 4) Get all classifications for the dropdown
    let classifications = []
    if (typeof invModel.getClassifications === "function") {
      classifications = await invModel.getClassifications()
    }

    // 5) Build a readable name for the page title and heading
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    // 6) Render the edit-inventory view and pre-fill all fields
    res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      errors: null,
      // For the dropdown (same pattern as add-inventory.ejs)
      classifications,
      classification_id: itemData.classification_id,
      // Hidden primary key (which record are we editing?)
      inv_id: itemData.inv_id,
      // Sticky values for every single field
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
    })
  } catch (error) {
    console.error("[CTRL] buildEditInventory error:", error)
    next(error)
  }
}
/* ******************************
 * Update Vehicle Data - POST
 * Module 06 | Week 09
 ****************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    // Check incoming body
    console.log("[CTRL] updateInventory received body:", req.body);

    // Build the nav
    const nav = await utilities.getNav()

    // Get updated values from the form
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body

    // Send data to the model to run the UPDATE query
    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    )

    // If the update worked, flash success and go back to management view
    if (updateResult) {
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", `The ${itemName} was successfully updated.`)
      return res.redirect("/inv/")
    }

    // If the update failed, rebuild dropdown and re-render edit view
    let classifications = []
    if (typeof invModel.getClassifications === "function") {
      classifications = await invModel.getClassifications()
    }

    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")

    return res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      errors: null,
      // Dropdown data
      classifications,
      classification_id,      
      inv_id, // Hidden primary key
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })
  } catch (error) {
    console.error("[CTRL] updateInventory error:", error)
    next(error)
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
  updateInventory: invCont.updateInventory, 
  deleteView: invCont.deleteView,  // GET
  deleteItem: invCont.deleteItem,   // POST
}