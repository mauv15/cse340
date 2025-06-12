// Needed Resources 
const express = require("express")
const router = new express.Router() 

const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory management view
router.get("/", utilities.handleErrors(invController.buildManagement))

//Route to build add classification
router.get("/add-class", utilities.handleErrors(invController.buildAddClassification))

// Route to handle classification submission
router.post(
  "/add-class",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Display the Add Inventory form
router.get("/add-inv", invController.buildAddInventory)

// Process Add Inventory form
router.post(
  "/add-inv",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

//route to build inventory detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

module.exports = router;