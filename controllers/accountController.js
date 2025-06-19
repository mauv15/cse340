const utilities = require('../utilities/index')
const accountModel = require('../models/account-model')
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
require("dotenv").config()


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  const flashMessages = req.flash('message') // always returns array
  res.render("account/login", {
    title: "Login",
    nav,
    message: flashMessages.length ? flashMessages[0] : null, // safely pass message
  })
}

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
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  let nav = await utilities.getNav()
  try {
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    const hashedPassword = await bcrypt.hash(account_password, 10)

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )


    if (regResult.rowCount > 0) {
      req.flash("message", `Congratulations, you're registered ${account_firstname}. Please log in.`)
      const flashMessages = req.flash("message")
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        message: flashMessages.length ? flashMessages[0] : null, // ✅ FIX
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
      account_firstname: account_firstname,
      account_lastname: account_lastname,
      email: account_email
    })
  }
  console.log("registerAccount controller called")
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash(
        "message notice",
        "Please check your credentials and try again."
      );
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

async function buildAccountManagement(req, res) {
  const nav = await utilities.getNav()
  const accountData = res.locals.accountData || null;

  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData,
    errors: null,
    message: req.flash("message"),
  });
}

async function buildUpdateAccountView(req, res) {
  const account_email = res.locals.accountData.account_email || req.body.account_email || '';
  const Data = await accountModel.getAccountByEmail(account_email)
  const accountData = Data
  const nav = await utilities.getNav()

  res.render("./account/update-account", {
    title: "Update Account",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email
  })
}


async function updateAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const updateResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id)
  console.log("Update Result:", updateResult)

  let nav = await utilities.getNav()
  if (updateResult.rowCount > 0) {
    req.flash("message", "Account information updated successfully."),
    console.log("Account updated successfully.")
  } else {
    req.flash("message", "Account update failed."),
    console.log("Account update failed.")
  }

  const updatedAccount = await accountModel.getAccountById(account_id)
  console.log("Updated Account:", updatedAccount)
  res.render("account/management", {
    title: "Account Management",
    nav,
    message: req.flash("message"),
    accountData: updatedAccount
  })
}

async function changePassword(req, res) {
  const { account_id, account_password } = req.body
  const hashedPassword = await bcrypt.hash(account_password, 10)
  const updateResult = await accountModel.updatePassword(hashedPassword, account_id)

  let nav = await utilities.getNav()
  if (updateResult.rowCount > 0) {
    req.flash("message", "Password updated successfully."),
    console.log("Password updated successfully.")
  } else {
    req.flash("message", "Password update failed."),
    console.log("Password update failed.")
  }

  const updatedAccount = await accountModel.getAccountById(account_id)
  res.render("account/management", {
    title: "Account Management",
    nav,
    message: req.flash("message"),
    accountData: updatedAccount
  })
}




module.exports = { buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildUpdateAccountView,
  updateAccount,
  changePassword
}
