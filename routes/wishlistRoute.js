const express = require("express")
const router = new express.Router()
const wishlistController = require("../controllers/wishlistController")
const utilities = require("../utilities")

router.get("/", utilities.checkLogin, utilities.handleErrors(wishlistController.viewWishlist))
router.post("/add", utilities.checkLogin, utilities.handleErrors(wishlistController.addVehicle))
router.post("/remove", utilities.checkLogin, utilities.handleErrors(wishlistController.removeVehicle))

module.exports = router
