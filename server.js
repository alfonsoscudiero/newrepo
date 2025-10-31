/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const env = require('dotenv').config(); // Load environment variables early
const app = express();
const session = require("express-session"); //express-session
const pool = require('./database/'); // Postgres pool
const bodyParser = require("body-parser"); //// Parse JSON & 

// HTML form bodies
// Controllers and Utilities
const static = require('./routes/static');
const baseController = require('./controllers/baseController');
const inventoryRoute = require('./routes/inventoryRoute');
const utilities = require('./utilities/');
// Enable account routes (handles /account/* paths like /account/login) - Module 05
const accountRoute = require("./routes/accountRoute");

/* ***********************
 * View Engine and Templates
 *************************/
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', './layouts/layout'); // not at views root

/* ***********************
 * Middleware
 * ************************/

// This sets up Sessions using express-session and stores session data in PostgreSQL database
app.use(session({ //invokes the app.use() function
    store: new (require('connect-pg-simple')(session))({ //where the session data will be stored
        createTableIfMissing: true, // creates 'session' table automatically if it doesn't exist
        pool,                       // uses our database connection from database/index.js
    }),
    secret: process.env.SESSION_SECRET, // protects session data; we’ll create this key in the .env file later
    resave: true,                       // must be true when using flash messages
    saveUninitialized: true,            // creates a session even if nothing is stored yet
    name: 'sessionId',                  // name of the cookie that stores the session ID
}))

// ***********************
// Express Messages Middleware
// ***********************
app.use(require('connect-flash')()) //loads the connect-flash package and enables flash messages
app.use(function (req, res, next) {
    // Make messages() helper available in all views (EJS files)
    res.locals.messages = require('express-messages')(req, res)
    next() // continue to the next middleware or route
})

// ***************************************************
// Make parsed body available at req.body | Module 05
// ***************************************************
app.use(bodyParser.json()) //use the body parser to work with JSON data
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/* ***********************
 * Routes
 *************************/
// // loads static content routes
app.use(static); 
// Keep using the utilities wrapper so async errors hit the handler below
app.get('/', utilities.handleErrors(baseController.buildHome))
// Inventory feature routes
app.use('/inv', inventoryRoute); 
// Module 05 - Anything defined in routes/accountRoute.js is now reachable under /account 
app.use("/account", accountRoute); //Account route


/* ***********************
 * Express Error Handler - Global error handler (INLINE)
 * Place after all other middleware.
 * This runs only when next(err) is called or an async route throws.
 *************************/
app.use(async (err, req, res, next) => {
    // ensure we always have a numeric status and a safe message
    let status = Number(err?.status) || 500;

    let message;
    if (status === 404) {
        message = "Oops! That page took a wrong turn";
    } else if (status >= 500) {
        message = "Oops! Something went wrong on our side. Please try again later.";
    } else {
        message = err?.message || "Oops! Something was wrong with your request.";
    }

    // Try to build nav; if it fails, still render an error page.
    let nav = '';
    try {
        nav = await utilities.getNav();
    } catch (navErr) {
        console.error('Nav build failed in error handler:', navErr.message);
    }

    res.status(status).render('errors/error', {
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