// routes/inventoryRoute.js

// Inventory feature routes
const express = require("express")
const router = new express.Router()

// Controllers & Utilities
const invController = require("../controllers/invController")
const utilities = require("../utilities") 

// Route to build inventory by classification view
// Example: /inv/type/1
router.get (
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// Route to build a single vehicle detail view
// Example: /inv/detail/10
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildVehicleDetail)
)

// Route to build the Home Page of the inventory section
router.get(
  "/", utilities.handleErrors(invController.buildManagementView)
)

module.exports = router