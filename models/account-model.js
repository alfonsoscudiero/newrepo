// models/account-model.js
/* ***************************
 *  Account Model - Module 05
 *  Handles database operations for "Account"
 * ************************** */

// Import the PostgreSQL database connection pool for executing SQL queries
const pool = require("../database/")

/* ***************************
 *  Register new account
 *  Params: firstname, lastname, email, password
 *  Returns: the result of the INSERT query
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    // SQL command to insert a new record into the "account" table
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password) VALUES ($1, $2, $3, $4)"

    // Execute the SQL command using parameterized query to avoid SQL injection
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    // If something goes wrong (like duplicate email or DB issue), return the error message
    return error.message
  }
}

// Export model functions
module.exports = { registerAccount }
