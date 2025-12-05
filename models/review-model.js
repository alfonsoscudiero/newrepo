// models/review-model.js
/* ***************************
 *  Review Model
 * ************************** */
const pool = require('../database/'); 

/* ************************************
 * Get all reviews for a specific vehicle
 * Module 07 | Weeks 12 -14
 ************************************ */
async function getReviewsByInvId(inv_id) {
    try {
    // SQL query: select reviews + account info for this car
    const sql = `
        SELECT 
            r.review_id,
            r.review_text,
            r.review_date,
            r.account_id,
            a.account_firstname,
            a.account_lastname
        FROM public.review AS r
        JOIN public.account AS a
            ON r.account_id = a.account_id
        WHERE r.inv_id = $1
        ORDER BY r.review_date DESC;
    `

    // Execute the SQL query, sending inv_id
    const result = await pool.query(sql, [inv_id])

    // Debug
    console.log("[MODEL] getReviewsByInvId inv_id:", inv_id, "| rows:", result?.rows?.length)

    // Return the rows array (each row = 1 review)
    return result.rows || []

    } catch (error) {
        console.error("[MODEL] getReviewsByInvId error:", error)
        return []
    }
}

// Export both functions together
module.exports = {
    getReviewsByInvId,
};
