/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const env = require('dotenv').config();   // Load environment variables early
const app = express();

// Controllers and Utilities
const static = require('./routes/static');
const baseController = require('./controllers/baseController');
const inventoryRoute = require('./routes/inventoryRoute');
const utilities = require('./utilities/'); 

/* ***********************
 * View Engine and Templates
 *************************/
app.set('view engine', 'ejs'); 
app.use(expressLayouts); 
app.set('layout', './layouts/layout'); // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static); // loads static content routes
app.get('/', baseController.buildHome); // homepage route
app.use('/inv', inventoryRoute); // Inventory feature routes

// File Not Found Route - must be last route in list
// — If nothing else matched, we "intentionally" pass a 404 error object
//   into the pipeline so the Express Error Handler above renders our view.
app.use(async (req, res, next) => {
    next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* ***********************
 * Express Error Handler - Global error handler
 * Place after all other middleware
 * — This runs only when `next()` receives an error object,
 *   or an error is thrown in an async route wrapped to pass errors along.
 *************************/

// app.use(async (err, req, res, next) => {
    // Build nav for the error view
    // let nav = await utilities.getNav();

    // Helpful server log to see where/what failed (route + message)
    // console.error(`Error at: "${req.originalUrl}": ${err.message}`);

    // Render a friendly error page.
    // title: prefer an explicit status (e.g., 404), otherwise "Server Error"
    // message: the human-readable description sent with the error

//     res.render('errors/error', {
//         title: err.status || 'Server Error',
//         message: err.message,
//         nav,
//     });
// });

app.use(async (err, req, res, next) => {
    // CHANGED: ensure we always have a numeric status and a safe message
    const status = Number(err?.status) || 500;
    const message = err?.message || (status === 404
    ? "The requested resource could not be found."
    : "Something went wrong on our side.");

    // Helpful server log to see where/what failed (route + message)
    console.error(`Error at: "${req.originalUrl}": ${message}`);

    // Try to build nav; if it fails, still show an error page.
    let nav = "";
    try {
        nav = await utilities.getNav();
        } catch (navErr) {
        console.error("Nav build failed in error handler:", navErr.message);
    }

  // CHANGED: set real HTTP status, pass both title and status to the view
    res
    .status(status)
    .render('errors/error', {
        title: status === 404 ? 'Not Found' : 'Server Error', 
        status, 
        message,
        nav,
    });
});



/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST; 

/* ***********************
 * Log statement to confirm server operation
My Account
Home
Custom
SUV
 *************************/
app.listen(port, () => {
    console.log(`app listening on ${host}:${port}`);
});
