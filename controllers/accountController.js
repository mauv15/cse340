const utilities = require('../utilities/index')
const accountModel = require('../models/account-model')


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    message: req.flash('message') || null,
    nav,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    account_firstname: req.body?.account_firstname || '',
    account_lastname: req.body?.account_lastname || '',
    account_email: req.body?.account_email || '',
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    )

    if (regResult.rowCount > 0) {
      req.flash("message", `Congratulations, you're registered ${account_firstname}. Please log in.`)
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        message: req.flash("message"),
      })
    } else {
      throw new Error("Registration failed.")
    }
  } catch (error) {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: error.message,
      first_name: account_firstname,
      last_name: account_lastname,
      email: account_email
    })
  }
  console.log("registerAccount controller called")
}

module.exports = { buildLogin, buildRegister, registerAccount }
