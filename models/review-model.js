// models/review-model.js
//  Model functions for working with the "review" table in the database

const pool = require('../database/'); 
// Object to hold all review-related queries
const reviewModel = {}

/* ************************************
 * Get all reviews for a specific vehicle
 * Used when building the vehicle details page
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

/* *************************************
 * Add a new review to the database
 * Called from revController.addReview()
 * ************************************* */
async function addReview (review_text, inv_id, account_id) {
    try {
        // SQL statement to insert a new review.
        const sql = `
        INSERT INTO public.review (
            review_text,
            inv_id,
            account_id
        )
        VALUES ($1, $2, $3)
        RETURNING *
        `
        // Execute the SQL statement. pool.query sends the SQL to PostgreSQL.
        const data = await pool.query(sql, [review_text, inv_id, account_id])

        // Return the inserted row so the controller can
        // check success (truthy) or inspect the data if needed.
        return data.rows[0]
    } catch (error) {
        console.error("[MODEL] addReview error:", error) 
        throw error // Send error upward to the controller
    }
}
// Export functions so controllers can call them
module.exports = {
    getReviewsByInvId,
    addReview,
}