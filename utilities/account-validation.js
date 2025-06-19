const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")

const validate = {}
  
/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required."),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }


/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

validate.loginRules = () => {
  return [
    // Email is required and must be valid
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // Password is required (we don't check strength on login)
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
  ]
}

validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await require("../utilities/").getNav()
    return res.render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email: req.body.account_email
    })
  }
  next()
}

validate.updateRules = () => {
  return [
    body("account_firstname").trim().notEmpty().withMessage("First name is required."),
    body("account_lastname").trim().notEmpty().withMessage("Last name is required."),
    body("account_email")
      .trim()
      .isEmail().withMessage("A valid email is required.")
      .normalizeEmail()
      .custom(async (email, { req }) => {
        const account = await accountModel.getAccountByEmail(email)
        if (account && account.account_id != req.body.account_id) {
          throw new Error("Email already exists.")
        }
        return true
      })
  ]
}

validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("./account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData: { account_id, account_firstname, account_lastname, account_email }
    })
  }
  next()
}

validate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .isLength({ min: 12 })
      .withMessage("Password must be at least 12 characters long.")
      .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter.")
      .matches(/[a-z]/).withMessage("Password must contain a lowercase letter.")
      .matches(/[0-9]/).withMessage("Password must contain a number.")
      .matches(/[!@#$%^&*]/).withMessage("Password must contain a special character.")
  ]
}

validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  const { account_id, account_password } = req.body
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const account = await accountModel.getAccountById(account_id)
    return res.render("./account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData: account
    })
  }
  next()
}


module.exports = validate