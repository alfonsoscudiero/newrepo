/* ********************************************
 * inv-update.js
 * Module 06 | Week 09
 * Enable the Update button only after some change in the form
 * ******************************************** */
console.log("inventory.js is RUNNING");

const form = document.querySelector("#updateForm")

if (form) {
  //"input" triggers instantly when the user types or edits.
  // "change" only triggers after clicking outside the field.
  form.addEventListener("input", function () {
    // Look for a submit button inside this form
    const updateBtn =
      form.querySelector("button[type='submit']") ||
      form.querySelector("button")

    if (updateBtn) {
      updateBtn.removeAttribute("disabled")
    }
  })
}