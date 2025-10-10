// Bring in the inventory model so we can access the database functions.
// We will use it here to get the list of all classifications.
const invModel = require("../models/inventory-model")

// Create an empty object to hold our utility functions.
// Right now, it will only contain getNav().
const Util = {}

/* ***************************************
 * getNav()
 * Builds (constructs) the HTML navigation menu.
 * It creates an unordered list (<ul>) with links
 * to the Home page and each vehicle classification.
 * ***************************************/
Util.getNav = async function (req, res, next) {
  // Get all classification data from the database
  let data = await invModel.getClassifications()

  // Start the unordered list (<ul>)
  let list = "<ul>"

  // Add the Home page link as the first list item
  list += '<li><a href="/" title="Home page">Home</a></li>'

  // Loop through each classification row returned from the database
  data.rows.forEach((row) => {
    // Start a new list item for this classification
    list += "<li>"

    // Build the hyperlink for that classification
    list +=
      '<a href="/inv/type/' +
      row.classification_id + // use the id in the URL
      '" title="See our inventory of ' +
      row.classification_name + // show tooltip text
      ' vehicles">' +
      row.classification_name + // visible link text
      "</a>"

    // Close the list item
    list += "</li>"
  })

  // Close the unordered list tag
  list += "</ul>"

  // Return the completed HTML string back to the controller
  return list
}

// Export the Util object so other files (like controllers)
// can use getNav() when they need to build the navigation bar.
module.exports = Util
