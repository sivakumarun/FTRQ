function getJulianDate() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

document.addEventListener("DOMContentLoaded", () => {
  const mobileNumber = localStorage.getItem('userMobileNumber');

  if (mobileNumber) {
    document.getElementById("displayMobileNo").textContent = mobileNumber;

    const julianDate = getJulianDate();
    const leadRefNo = julianDate + "" + Math.floor(1000000000 + Math.random() * 9000000000);
    const applicationNo = julianDate + "" + Math.floor(100000000000 + Math.random() * 900000000000);

    document.getElementById("leadRefNo").textContent = leadRefNo;
    document.getElementById("applicationNo").textContent = applicationNo;

    document.getElementById("popupContainer").style.display = "block";
  } else {
    alert("No mobile number found. Please go back and fill the application form.");
    window.location.href = "qdeform.html";
  }

  document.getElementById("confirmButton").addEventListener("click", () => {
    const appCodeInput = document.getElementById("appCodeInput").value;
    const successMessage = document.getElementById("successMessage");

    if (appCodeInput.length === 6) {
      // Hide popup and show success message
      document.getElementById("popupContainer").style.display = "none";
      successMessage.textContent = "Form submitted successfully with App Code: " + appCodeInput;
      successMessage.style.color = "green";
      successMessage.style.display = "block";

      localStorage.removeItem('userMobileNumber');
    } else {
      successMessage.textContent = "Please enter a valid 6-digit Application Code.";
      successMessage.style.color = "red";
      successMessage.style.display = "block";
    }
  });

  document.getElementById("cancelButton").addEventListener("click", () => {
    document.getElementById("popupContainer").style.display = "none";
  });

  function goToNextPage() {
    // You can optionally validate inputs here before navigating
    const mobileNumber = document.getElementById('mobileNumber')?.value;
    if (!mobileNumber || mobileNumber.length < 10) {
      alert('Please enter a valid mobile number.');
      return;
    }

    localStorage.setItem('userMobileNumber', mobileNumber);
    window.location.href = "appcode.html"; // Replace with your next page
  }
});
