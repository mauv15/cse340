const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</a>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

Util.buildInventoryDetail = async function(data){
  let detail = ''
  if(data.length > 0){
    const vehicle = data[0]
    detail += '<div class="detail-container">'
    detail += '<img src="' + vehicle.inv_image + '" alt="Image of ' 
    + vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors" />'
    detail += '<div class="detail-info">'
    detail += '<h2>' + vehicle.inv_make + ' ' + vehicle.inv_model + ' ' + vehicle.inv_year + '</h2>'
    detail += '<p class="price">$' 
    + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</p>'
    detail += '<p class="description">' + vehicle.inv_description + '</p>'
    detail += '<p class="mileage">Mileage: '
    + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + ' miles</p>'
    detail += '</div>'
    detail += '</div>'
  } else {
    detail += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return detail
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next)
  } catch (err) {
    console.error("💥 Error caught by handleErrors:", err.message)

    // Fallback to login page with a flash message
    req.flash("message", "Something went wrong.")
    let nav = await Util.getNav()
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      message: "Something went wrong.",
    })
  }
}
// Util.handleErrors = (fn) => (req, res, next) => 
//   Promise.resolve(fn(req, res, next)).catch(next)

/**
 * Builds the select list of classifications for forms
 */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"

  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected"
    }
    classificationList += `>${row.classification_name}</option>`
  })

  classificationList += "</select>"
  return classificationList
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt
  if (!token) {
    res.locals.loggedin = false
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    res.locals.accountData = decoded
    res.locals.loggedin = true
    next()
  } catch (err) {
    res.locals.loggedin = false
    return next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

module.exports = Util
