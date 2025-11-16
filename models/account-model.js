// models/account-model.js
/* ***************************
 *  Account Model - Module 05
 *  Handles database operations for "Account"
 * ************************** */

// Import the PostgreSQL database connection pool for executing SQL queries
const pool = require("../database/")

/* ****************************************
 *  Return account data using email address
 *  Module 06 - Login Activity
 * **************************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email]
    )
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* ***************************
 *  Register new account
 *  Params: firstname, lastname, email, password
 *  Returns: the result of the INSERT query
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    // SQL command to insert a new record into the "account" table
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"

    // Execute the SQL command using parameterized query to avoid SQL injection
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    // If something goes wrong (like duplicate email or DB issue), return the error message
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount // 0 means no match; >0 means email exists
  } catch (error) {
    return error.message
  }
}

// Export model functions
module.exports = {
  getAccountByEmail,
  registerAccount,
  checkExistingEmail,
}
