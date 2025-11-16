// routes/inventoryRoute.js

// Inventory feature routes
const express = require("express")
const router = new express.Router()

// Controllers & Utilities
const utilities = require("../utilities")
const invController = require("../controllers/invController") 
const invValidate = require("../utilities/inventory-validation") 

// Route to build the Home Page of the inventory section
// GET /inv/
router.get(
  "/", utilities.handleErrors(invController.buildManagementView)
)

// Route to build inventory by classification view
// GET /inv/type/:classificationId
router.get (
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// Route to build a single vehicle detail view
// GET /inv/detail/:inv_id
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildVehicleDetail)
)

// ----------------------------------------------
// Route to deliver the "Add Classification" form
// GET /inv/add-classification
// ----------------------------------------------
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
)

// ----------------------------------------------
// Add Classification  - form submission (POST)
// POST /inv/add-classification 
// ----------------------------------------------
router.post(
  "/add-classification", 
  // Runs validation before controller
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification) // POST handler
)

// ----------------------------------------------
// Route to deliver the "Add Invnetory" form
// GET /inv/add-inventory 
// ----------------------------------------------
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
)

// ----------------------------------------------
// Add Inventory  - submit
// POST /inv/add-inventory 
// ----------------------------------------------
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkAddInventoryData,  // <-- use the actual name
  utilities.handleErrors(invController.addInventory)
)

/* ****************************************
 * JSON route for AJAX inventory fetch
 * URL: /inv/getInventory/:classification_id
 **************************************** */
router.get("/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

/* ****************************************
 * Edit Inventory 
 * GET /inv/edit/:inv_id
 * Module 06 | Week 09
 **************************************** */
router.get(
  "/edit/:inv_id", //The :inv_id parameter will receive the vehicle id from the "Modify" link
  utilities.handleErrors(invController.buildEditInventory)
)

/* ***************************
 *  Update Inventory Data (Step 2)
 *  POST /inv/edit/:inv_id
 *  Module 06 | Week 09
 * ************************** */
router.post(
  "/update",
  invValidate.newInventoryRules(),  
  invValidate.checkUpdateData,      
  utilities.handleErrors(invController.updateInventory)
)
/* ***************************
 *  Deliver Delete view 
 * GET /inv/delete/:inv_id
 * Module 06 - Week 09
 * ************************** */
router.get(
  "/delete/:inv_id",
  utilities.handleErrors(invController.deleteView)
)
/* ****************************************
 * Process the delete inventory request
 * POST /inv/delete
 * Module 06 | Delete Inventory
 **************************************** */
router.post(
  "/delete",
  utilities.handleErrors(invController.deleteItem)
)


module.exports = router