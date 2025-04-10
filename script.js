        function login() {
            var userID = document.getElementById("userID").value;
            var mpin = document.getElementById("mpin").value;

            if (userID === "SIVA" && mpin === "0894") {
                document.getElementById("loginScreen").style.display = "none";
                document.getElementById("homePage").style.display = "flex";
                return false; // Prevent form submission
            } else {
                alert("Invalid User ID or MPIN. Please try again.");
                return false;
            }
        }

        function toggleMenu() {
            var menu = document.getElementById("sideMenu");
            menu.classList.toggle("active");
        }

