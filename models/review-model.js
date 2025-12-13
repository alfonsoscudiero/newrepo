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
/* *************************************
 * Get all reviews by account_id
 * Used on Account Management page | Week 13
 * ************************************* */
async function getReviewsByAccountId (account_id) {
    try {
        const sql = `
        SELECT
            r.review_id,
            r.review_text,
            r.review_date,
            r.inv_id,
            r.account_id,
            i.inv_year,
            i.inv_make,
            i.inv_model
        FROM public.review AS r
        JOIN public.inventory AS i
            ON r.inv_id = i.inv_id
        WHERE r.account_id = $1
        ORDER BY r.review_date DESC;
        `

    const result = await pool.query(sql, [account_id])
    // Debug
    console.log(
        '[MODEL] getReviewsByAccountId account_id:',
        account_id,
        '| rows:',
        result?.rows?.length
    )
    // Safe to always return an array
    return result.rows || []
    } catch (error){
        console.error('[MODEL] getReviewsByAccountId error:', error)
        return []
    }
}

/* *************************************
 * Get a single review by review_id
 * Called from buildEditReviewView() in revController.js, and 
 * checkUpdateReviewData() in review-validation.js
 * ************************************* */
async function getReviewById(review_id) {
    try {
        // Fetch review from the database
        const sql = `
        SELECT
            r.review_id,
            r.review_text,
            r.review_date,
            r.inv_id,
            r.account_id,
            i.inv_make,
            i.inv_model,
            i.inv_year
        FROM public.review AS r
        JOIN public.inventory AS i
            ON r.inv_id = i.inv_id
        WHERE r.review_id = $1;
        `

        // Execute query passing the review id
        const result = await pool.query(sql, [review_id])

        // Debug: log how many rows came back
        console.log(
            "[MODEL] getReviewById review_id:",
            review_id,
            "| rows:",
            result?.rows?.length
        )

        // Return a single row, or null if none found
        return result.rows[0] || null
    } catch (error) {
        console.error("[MODEL] getReviewById error:", error)
        // On error, return null so controller can handle it
        return null
    }
}

/* *************************************
 * Update an existing review in the DB
 * Called from updateReview() in revController.js
 * ************************************* */
async function updateReview(review_id, review_text) {
    try {
        // SQL UPDATE statement:
        const sql = `
        UPDATE public.review
        SET review_text = $1
        WHERE review_id = $2
        RETURNING *;
        `

        // Execute the UPDATE statement directly in PostgreSQL
        const result = await pool.query(sql, [review_text, review_id])

        // Debug:
        console.log(
            "[MODEL] updateReview review_id:",
            review_id,
            "| rowCount:",
            result.rowCount
        )

        // If no rows were updated, return null 
        if (result.rowCount === 0) {
            return null
        }

        // Return the updated row
        return result.rows[0]
    } catch (error) {
        console.error("[MODEL] updateReview error:", error)
        // Let the controller handle unexpected DB errors
        throw error
    }
}

/* *************************************
 * Delete an existing review in the DB
 * Called from deleteReview() in revController.js
 * ************************************* */
async function deleteReview(review_id, account_id) {
    try {
        // SQL DELETE statement:
        const sql = `
        DELETE FROM public.review
        WHERE review_id = $1
        AND account_id = $2
        RETURNING *;
        `

        // Execute the DELETE statement directly in PostgreSQL
        const result = await pool.query(sql, [review_id, account_id])

        // Debug:
        console.log(
            "[MODEL] deleteReview review_id:",
            review_id,
            "| rowCount:",
            result.rowCount
        )
        // If no rows were deleted, return null 
        if (result.rowCount === 0) {
            return null
        }
        // Return the deleted row (RETURNING *)
        return result.rows[0]
    } catch (error) {
        console.error("[MODEL] deleteReview error:", error)
        // Let the controller handle unexpected DB errors
        throw error
    }
}

// Export functions so controllers can call them
module.exports = {
    getReviewsByInvId,
    addReview,
    getReviewsByAccountId,
    getReviewById,
    updateReview,
    deleteReview,
}
