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

/* **************************************
* Build the classification view HTML
* Plain English:
* - Receive an array of vehicles (data)
* - Build a <ul> list where each <li> shows a vehicle card:
*   image, name (make + model), price, and a link to its detail page
* - Return the final HTML string for the controller to render
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid // will hold the HTML to return

  if (data.length > 0){
    grid = '<ul id="inv-display">' // start the list

    // For each vehicle returned from the database, add a list item
    data.forEach(vehicle => { 
      grid += '<li>'

      // Clickable image: goes to the vehicle detail page by inv_id
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'

      // Name + Price section
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'

      // Clickable title: also goes to the vehicle detail page
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'

      grid += '</h2>'

      // Price formatted for US locale
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'

      grid += '</div>' // end .namePrice
      grid += '</li>'  // end one vehicle card
    })

    grid += '</ul>' // end the list
  } else { 
    // If no vehicles matched the classification, show a friendly message
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  // Return the HTML string to the controller so it can render the view
  return grid
}

