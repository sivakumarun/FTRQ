// Function to get the Julian date for the current day
function getJulianDate() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const julianDay = Math.floor(diff / oneDay);
  return julianDay;
}

document.getElementById("infoForm").addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent form submission

  const mobileNumber = document.getElementById("mobileNumber").value;
  const julianDate = getJulianDate(); // Get the Julian date

  // Generating Lead Ref No and Application No using Julian date
  const leadRefNo = julianDate + "" + Math.floor(1000000000 + Math.random() * 9000000000);
  const applicationNo = julianDate + "" + Math.floor(100000000000 + Math.random() * 900000000000);

  document.getElementById("leadRefNo").textContent = leadRefNo;
  document.getElementById("applicationNo").textContent = applicationNo;
  document.getElementById("displayMobileNo").textContent = mobileNumber;

  // Open the confirmation popup
  document.getElementById("popupContainer").style.display = "flex";
});

document.getElementById("confirmButton").addEventListener("click", function() {
  const appCodeInput = document.getElementById("appCodeInput").value;

  if (appCodeInput.length === 6) {
    alert("Form submitted successfully with App Code: " + appCodeInput);
    // Here, you can add code to process the form data as needed.

    // Close the popup
    document.getElementById("popupContainer").style.display = "none";
  } else {
    alert("Please enter a valid 6-digit Application Code.");
  }
});

//adding confirm button re-direct url
//document.getElementById("confirmButton").addEventListener("click", function() {
//    const appCodeInput = document.getElementById("appCodeInput").value;
//
//    if (appCodeInput.length === 6) {
//      // Redirect to form.html
//      window.location.href = "form.html";
//    } else {
//      alert("Please enter a valid 6-digit Application Code.");
//    }
//  });

document.getElementById("cancelButton").addEventListener("click", function() {
  // Close the popup without submitting the form
  document.getElementById("popupContainer").style.display = "none";
});