/* ********************************************
 * toggle-password.js
 * Module 06 | Week 10: AJAX Select Inventory
 * script to toggle password visibility ******************************************** */
console.log("toggle-password.js is RUNNING")

document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("account_password");

  // If either element is missing, do nothing.
  if (!toggleBtn || !passwordInput) return;

  toggleBtn.addEventListener("click", function () {
    // Check the current type of the password input
    const isHidden = passwordInput.getAttribute("type") === "password";

    // Toggle the type between "password" and "text"
    passwordInput.setAttribute("type", isHidden ? "text" : "password");

    // Update the button text so the user knows what will happen next
    toggleBtn.textContent = isHidden ? "Hide Password" : "Show Password";
  });
});