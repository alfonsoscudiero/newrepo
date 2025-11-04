// models/inventory-model.js
/* ***************************
 *  Inventory Model
 * ************************** */
const pool = require('../database/'); // ".." means "go up one folder" (from /models to /database)

/* ****************************************
 *  Get all classification data (getNav)
 * ************************************** */
async function getClassifications() {
    return await pool.query(
        'SELECT * FROM public.classification ORDER BY classification_name'
    );
}

/* ***************************
 *  Module 07 - Assignment 04 Task 2
 *  Handles database operations for "Add Classification"
 * ************************** */
async function addClassification(name) {
    try {
    const sql = `
        INSERT INTO public.classification (classification_name)
        VALUES ($1)
        RETURNING classification_id
        `
    // Parameterized query
    const result = await pool.query(sql, [name]);
    // Debug
    console.log("[MODEL] addClassification id:", result?.rows?.[0]?.classification_id);
    // Return classification Object
    return {
        rowCount: result.rowCount,
        id: result.rows?.[0]?.classification_id,
    };
    } catch (error) {
        // Debug
        console.error("[MODEL] addClassification error:", error)
        throw error
    }
}

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

        console.log("[CLASSIFICATION] classification by id =", data?.rows?.length || 0);
        // Return the array of matching rows to the controller
        return data.rows || null;
    } catch (error) {
        // For now, log the error. (Later you might use a centralized error handler.)
        console.error('getclassificationsbyid error ' + error);
        throw error
    }
}

/* ***************************
 *  Get vehicle details by inventory id
 * ************************** */
async function getVehicleById(inv_id) {
    try {
        const id = Number(inv_id); // ensure numeric
        console.log("[MODEL] getVehicleById id =", id);

        const data = await pool.query(
        `SELECT i.*, c.classification_name
            FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.inv_id = $1`,
        [id]
        );

        console.log("[MODEL] rows returned =", data?.rows?.length || 0);
        return data.rows[0] || null; // single row or undefined
    } catch (error) {
        console.error("[MODEL] getVehicleById error:", error);
        throw error; // let the global handler show a friendly 500
    }
}

/* ***************************
 *  Get a single classification by id - Assignment 04 Task 03
 * sed by server-side validation to verify that the
 * selected classification_id actually exists in the DB.
 * ************************** */
async function getClassificationById(classification_id) {
    try {
        const id = Number(classification_id);
        console.log("[MODEL] getClassificationById =", id);

        const sql = `
            SELECT *
                FROM public.classification
                WHERE classification_id = $1
            `
        const result = await pool.query(sql, [id])
        // Debug
        console.log("[MODEL] getClassificationById rows:", result?.rows.length || 0);
        return result;
    } catch (error) {
        console.error("[MODEL] getClassificationById error:", error);
        throw error;
    }
}

/* ***************************
 *  NEW: Insert a new inventory record
 *  - Used by invController.addInventory (Assignment 04 - Task 3)
 *  - The parameter order here matches how the controller calls it.
 * ************************** */
async function addInventory(
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
) {
    try {
        const sql = `
        INSERT INTO public.inventory
            (inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING inv_id
        `

        const values = [
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id,
        ]

        const result = await pool.query(sql, values)

        console.log("[MODEL] addInventory new inv_id:", result?.rows?.[0]?.inv_id);

    // Return a small summary that the controller can log / use if needed
        return {
            rowCount: result.rowCount, // should be 1 on success
            id: result.rows?.[0]?.inv_id, // new inventory primary key
        }
    } catch (error) {
        console.error("[MODEL] addInventory error:", error)
        throw error
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
    getClassifications, 
    addClassification,
    getInventoryByClassificationId,
    getVehicleById,
    getClassificationById,
    addInventory, 
};
