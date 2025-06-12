const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory by inventory id
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const invId = req.params.invId
  const data = await invModel.getInventoryByInvId(invId)
  const detail = await utilities.buildInventoryDetail(data)
  let nav = await utilities.getNav()
  if (data.length > 0) {
    res.render("./inventory/detail", {
      title: data[0].inv_make + " " + data[0].inv_model + " details",
      nav,
      detail,
      vehicle: data[0],
    })
  } else {
    res.status(404).render("404", { title: "Vehicle Not Found", nav })
  }
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: req.flash("message"),
  })
}

/* ***************************
 *  Deliver add-classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    message: req.flash("message"),
    errors: null,
  })
}

/* ***************************
 *  Process classification addition
 * ************************** */
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body

  try {
    const result = await invModel.addClassification(classification_name)
    if (result.rowCount > 0) {
      req.flash("message", "Classification successfully added.")
      let nav = await utilities.getNav()
      res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        message: req.flash("message")
      })
    } else {
      throw new Error("Insert failed.")
    }
  } catch (error) {
    console.error("Error adding classification:", error)
    let nav = await utilities.getNav()
    res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      message: "Sorry, adding the classification failed.",
      errors: []
    })
  }
}

/* Build the add inventory view */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationList,
    message: null,
    errors: [],
  })
}

/* Process adding inventory */
invCont.addInventory = async function (req, res, next) {
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

  const insertResult = await invModel.addInventory(
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  )

  let nav = await utilities.getNav()

  if (insertResult) {
    req.flash("notice", "Inventory successfully added.")
    res.redirect("/inv/")
  } else {
    let classificationList = await utilities.buildClassificationList(classification_id)
    res.render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: req.flash("error"),
      message: "Sorry, the inventory item could not be added.",
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
    })
  }
}

module.exports = invCont