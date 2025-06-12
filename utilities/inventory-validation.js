const utilities = require(".")
const { body, validationResult } = require("express-validator")

const validate = {}

validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("No spaces or special characters allowed.")
  ]
}

validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  const errors = validationResult(req)
  let nav = await require("../utilities/").getNav()

  if (!errors.isEmpty()) {
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      message: null,
      errors: errors.array(),
      classification_name
    })
  }

  next()
}

validate.inventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .isInt({ min: 1 })
      .withMessage("Please choose a valid classification."),
    body("inv_make")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Please provide a valid make."),
    body("inv_model")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Please provide a valid model."),
    body("inv_description")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Please provide a meaningful description."),
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),
    body("inv_price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Please enter a valid price."),
    body("inv_year")
      .trim()
      .isInt({ min: 1886 }) // Oldest car year
      .withMessage("Please enter a valid year."),
    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Miles must be a valid number."),
    body("inv_color")
      .trim()
      .isAlpha()
      .withMessage("Color must contain only letters."),
  ]
}

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  const { classification_id } = req.body

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()

    // ✅ Get vehicles by classification ID from model
    const invModel = require("../models/inventory-model")
    const data = await invModel.getInventoryByClassificationId(classification_id)

    // ✅ Now build the classification list with actual vehicle data
    let classificationList = await utilities.buildClassificationGrid(data.rows)

    res.render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      message: null,
      errors: errors.array(),
      ...req.body, // sticky values
    })
    return
  }

  next()
}


module.exports = validate