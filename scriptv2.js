<script>
    document.getElementById("infoForm").addEventListener("submit", function(event) {
        event.preventDefault();
        document.getElementById("loaderContainer").style.display = "flex";

        // Simulate a network request delay
        setTimeout(function() {
            document.getElementById("loaderContainer").style.display = "none";

            // Generate random numbers
            const leadRefNo = Math.floor(1000 + Math.random() * 9000);
            const applicationNo = Math.floor(100000 + Math.random() * 900000);


            // Show the pop-up after the loader animation
            document.getElementById("popupContainer").style.display = "flex";
        }, 3000);
    });

    document.getElementById("confirmButton").addEventListener("click", function() {
        const appCode = document.getElementById("appCodeInput").value;
        alert("Application Code: " + appCode);
        document.getElementById("popupContainer").style.display = "none";
    });

    document.getElementById("cancelButton").addEventListener("click", function() {
        document.getElementById("popupContainer").style.display = "none";
    });
</script>
