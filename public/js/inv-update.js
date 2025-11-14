/* ********************************************
 * inv-update.js
 * Module 06 | Week 09
 * Enable the Update button only after some change in the form
 * ******************************************** */
const form = document.querySelector("#updateForm")
    form.addEventListener("change", function () {
      const updateBtn = document.querySelector("button")
      updateBtn.removeAttribute("disabled")
    })