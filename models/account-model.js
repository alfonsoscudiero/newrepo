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
    console.error("[MODEL] getAccountByEmail error:", error)
    return null
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
    console.error("[MODEL] registerAccount error:", error)
    return null
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
    console.error("[MODEL] checkExistingEmail error:", error)
    return null
  }
}

/* ****************************************
 *  Account Information Update
 *  POST /account/update
 *  Module 06 | Week 10 Task 4 & 5
 * **************************************** */
async function updateAccount(account_firstname, account_lastname, account_email, account_id) {
  try {
    const sql = `
      UPDATE account
      SET
        account_firstname = $1,
        account_lastname  = $2,
        account_email     = $3
      WHERE account_id    = $4
    `

    const data = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    ])

    // data.rowCount will be 1 if the update succeeded, 0 if nothing changed
    return data.rowCount
  } catch (error) {
    console.error("updateAccount model error:", error)
    throw error
  }
}

/* ****************************************
 *  Update Account Password
 *  Module 06 - Week 10 Task 4 & 5
 * **************************************** */
async function updatePassword(hashedPassword, account_id) {
  try {
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_id     = $2
    `

    const data = await pool.query(sql, [hashedPassword, account_id])

    // Again, rowCount will be 1 if one row was updated
    return data.rowCount
  } catch (error) {
    console.error("updatePassword model error:", error)
    return null
  }
}

/* ****************************************
 *  Update Account Password
 *  Module 06 - Week 10 Task 4 & 5
 * **************************************** */
async function getAccountById (account_id) {
  try {
    // Query to retrieve a single account record using its ID
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password
      FROM account
      WHERE account_id = $1
    `
    // Send the SQL statement to PostgreSQL and retrieve the account data
    const result = await pool.query(sql, [account_id])
    // If the account exists, returns the full account object
    // If no record is found or an error occurs, returns null
    return result.rows[0] || null
  } catch (error) {
    console.error("getAccountById model error:", error)
    return null
  }
}

// Export model functions
module.exports = {
  getAccountByEmail,
  registerAccount,
  checkExistingEmail,
  updateAccount,
  updatePassword,
  getAccountById,
}
