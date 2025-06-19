const wishlistModel = require("../models/wishlist-model")
const utilities = require("../utilities")

async function addVehicle(req, res, next) {
  try {
    const { inv_id } = req.body
    const account_id = res.locals.accountData.account_id
    await wishlistModel.addToWishlist(account_id, inv_id)
    req.flash("message", "Vehicle added to your wishlist.")
    res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    next(new Error("Failed to add vehicle to wishlist."))
  }
}

async function viewWishlist(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const wishlist = await wishlistModel.getWishlistByAccount(account_id)
    const nav = await utilities.getNav()
    res.render("./wishlist/wishlist", {
      title: "My Wishlist",
      nav,
      wishlist,
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

async function removeVehicle(req, res, next) {
  try {
    const { inv_id } = req.body
    const account_id = res.locals.accountData.account_id
    await wishlistModel.removeFromWishlist(account_id, inv_id)
    req.flash("message", "Vehicle removed from wishlist.")
    res.redirect("/wishlist")
  } catch (error) {
    next(error)
  }
}

module.exports = { addVehicle, viewWishlist, removeVehicle }
