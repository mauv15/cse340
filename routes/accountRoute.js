const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")

// Route to build register page
router.get("/register", accountController.buildRegister)

// Route to handle form submission
router.post("/register", accountController.registerAccount)

// Optional: login route
router.get("/login", accountController.buildLogin)

console.log("Account routes loaded")


module.exports = router

// const express = require("express")
// const router = new express.Router() 
// const utilities = require('../utilities/index')
// const accountController = require('../controllers/accountController')

// router.get('/login', utilities.handleErrors(accountController.buildLogin));

// router.get('/register', utilities.handleErrors(accountController.buildRegister));

// router.post(
//     '/register',
//      utilities.handleErrors(accountController.registerAccount))


// module.exports = router;
