const pool = require('../database/');

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
    return await pool.query(
        'SELECT * FROM public.classification ORDER BY classification_name'
    );
}

module.exports = { getClassifications };

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 *  - Ask the database for vehicles that belong to a specific classification
 *  - Also join the classification table to get the readable classification name
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        // Use a parameterized query ($1) to prevent SQL injection
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
            [classification_id] // <-- This replaces $1 safely
        );
        // Return the array of matching rows to the controller
        return data.rows;
    } catch (error) {
        // For now, log the error. (Later you might use a centralized error handler.)
        console.error('getclassificationsbyid error ' + error);
    }
}

/* 
  IMPORTANT:
  - Make sure this function is exported so the controller can call it.
  - If you already have module.exports elsewhere, add this function to that object.
  Example (keep your existing exports and just include this name too):
*/
// Export both functions together
module.exports = {
    getClassifications, // (existing)
    getInventoryByClassificationId, // (this one)
};
