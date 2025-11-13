/* ********************************************
 * inventory.js
 * Module 06 | Week 09: AJAX Select Inventory
 * Task 1: Event listener for classification <select>
 * ******************************************** */
'use strict'

// Get a list of items in inventory based on the classification_id
let classificationList = document.querySelector("#classificationList")

classificationList.addEventListener("change", function () {

  let classification_id = classificationList.value
  console.log(`classification_id is: ${classification_id}`)

  let classIdURL = "/inv/getInventory/" + classification_id

  fetch(classIdURL)
    .then(function (response) {
      if (response.ok) {
        return response.json()
      }
      throw Error("Network response was not OK")
    })
    .then(function (data) {
      console.log(data)
      buildInventoryList(data)
    })
    .catch(function (error) {
      console.log('There was a problem: ', error.message)
    })
})

/* ********************************************
 * Task 2: Build the inventory list (table)
 ******************************************** */
function buildInventoryList(data) {
  // 1. Get a reference to the <table> in management.ejs
  let inventoryDisplay = document.getElementById("inventoryDisplay")

  // 2. Start building the table header
  let dataTable = "<thead>"
  dataTable += "<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>"
  dataTable += "</thead>"

  // 3. Set up the table body
  dataTable += "<tbody>"

  // 4. Loop through each vehicle object returned from the server
  data.forEach(function (element) {
    // Helpful for debugging
    console.log(element.inv_id + ", " + element.inv_model)

    // Open the row and first cell: vehicle name
    dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`

    // Second cell: link to edit (modify) the vehicle
    dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`

    // Third cell: link to delete the vehicle
    dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`
  })

  // 5. Close the table body
  dataTable += "</tbody>"

  // 6. Inject the finished HTML string into the table element
  inventoryDisplay.innerHTML = dataTable
}