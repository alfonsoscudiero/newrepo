// Imports the "Pool" functionality from the "pg" package. A pool is a collection of connection objects (10 is the default number) that allow multiple site visitors to be interacting with the database at any given time. 
const { Pool } = require("pg")

// Imports the "dotenv" package which allows the sensitive information about the database location and connection credentials to be stored in a separate location and still be accessed.
require("dotenv").config()

/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app.
 * But will cause problems in production environment.
 * If - else will make determination which to use
 * *************** */

let pool  /* Creates a local pool variable to hold the functionality of the "Pool" connection.*/

// an if test to see if the code exists in a developent environment, as declared in the .env file
if (process.env.NODE_ENV == "development") {
  pool = new Pool({  /* creates a new pool instance from the imported Pool class */
    connectionString: process.env.DATABASE_URL, /* indicates how the pool will connect to the database */
    ssl: { rejectUnauthorized: false }, /* describes how the Secure Socket Layer (ssl) is used in the connection to the database, but only in a remote connection*/
  })

  // Added for troubleshooting queries during development
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params)
        console.log("executed query", { text })
        return res
      } catch (error) {
        console.error("error in query", { text })
        throw error
      }
    },
  }
} else {
  // Production: simpler export, no SSL helper or query logger
  pool = new Pool({ connectionString: process.env.DATABASE_URL })
  module.exports = pool
}
