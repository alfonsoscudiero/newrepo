/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const env = require('dotenv').config();
const app = express();
const static = require('./routes/static');
const baseController = require('./controllers/baseController');
const inventoryRoute = require('./routes/inventoryRoute');

/* ***********************
 * View Engine and Templates
 *************************/
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', './layouts/layout'); // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static);
// Index Route
// app.get('/', function (req, res) {
//     res.render('index', { title: 'Home' });
// });
app.get('/', baseController.buildHome);
// Inventory routes
app.use('/inv', inventoryRoute);

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 * — This runs only when `next()` receives an error object,
 *   or an error is thrown in an async route wrapped to pass errors along.
 *************************/
app.use(async (err, req, res, next) => {
    // Build nav for the error view
    let nav = await utilities.getNav();

    // Helpful server log to see where/what failed (route + message)
    console.error(`Error at: "${req.originalUrl}": ${err.message}`);

    // Render a friendly error page.
    // title: prefer an explicit status (e.g., 404), otherwise "Server Error"
    // message: the human-readable description sent with the error
    res.render('errors/error', {
        title: err.status || 'Server Error',
        message: err.message,
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
