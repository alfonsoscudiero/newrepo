// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Route to build a single vehicle detail view
// router.get("/detail/:inv_id", invController.buildVehicleDetail)

// Route to build a single vehicle detail view
router.get("/detail/:inv_id", (req, res, next) => {
  console.log("[ROUTE] /inv/detail inv_id =", req.params.inv_id);
  next();
}, invController.buildVehicleDetail);

module.exports = router