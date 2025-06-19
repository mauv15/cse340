const pool = require('../database/')

async function addToWishlist(account_id, inv_id) {
  const sql = `
    INSERT INTO wishlist (account_id, inv_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
  `
  return pool.query(sql, [account_id, inv_id])
}

async function getWishlistByAccount(account_id) {
  const sql = `
    SELECT i.*
    FROM wishlist w
    JOIN inventory i ON w.inv_id = i.inv_id
    WHERE w.account_id = $1
  `
  const data = await pool.query(sql, [account_id])
  return data.rows
}

async function removeFromWishlist(account_id, inv_id) {
  const sql = `
    DELETE FROM wishlist WHERE account_id = $1 AND inv_id = $2
  `
  return pool.query(sql, [account_id, inv_id])
}

module.exports = {
  addToWishlist,
  getWishlistByAccount,
  removeFromWishlist
}
