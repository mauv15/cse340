CREATE TABLE wishlist (
  wishlist_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES account(account_id) ON DELETE CASCADE,
  inv_id INT NOT NULL REFERENCES inventory(inv_id) ON DELETE CASCADE,
  UNIQUE (account_id, inv_id) -- Prevent duplicates
);
