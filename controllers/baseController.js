// Bring in the helper functions from the utilities folder.
// We'll use one of these (getNav) to build the navigation bar.
const utilities = require("../utilities/")

// Create an empty object to hold all the controller functions.
const baseController = {}

/* ***************************************
 * buildHome() controls what happens
 * when someone visits the home page ("/")
 * ***************************************/
baseController.buildHome = async function (req, res) {
  // Wait for the navigation menu (built from the database)
  // to be returned from utilities/getNav()
  const nav = await utilities.getNav()

  // Flash message
  // first parameter indicates the "type" of message (it becomes a CSS class)
  // The second parameter is the actual message to be displayed
  req.flash("notice", "This is a flash message.")

  // Render (display) the 'index.ejs' view and send the data to it.
  // The EJS template will use the variables "title" and "nav".
  res.render("index", { title: "Home", nav })
}

// Make the baseController available to other files (like server.js)
module.exports = baseController
