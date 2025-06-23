$(document).ready(function() {
  // Data array for users and corresponding data
  var userData = [
    {
      username: "SIVA",
      password: "0894",
      data: [
        // Data for ram...
//        { approvalid: "RMPDOA-31072023001", region: "South", asp: "F1_info", sccode: "IN61-001", caseid: "IN68-023-R230725001", dcno: "IN68-023-SP230726001", boxc: "Damaged", doac: "Non-Functional", symptom: "MAC1", status: "Blank Display", statusby: "siva" },
      ]
    },

    {
      username: "siva",
      password: "kumar",
      data: [
        // Data for siva...
//        { approvalid: "RMPDOA-31072023001", region: "South", asp: "F1_info", sccode: "IN61-001", caseid: "IN68-023-R230725001", dcno: "IN68-023-SP230726001", boxc: "Damaged", doac: "Non-Functional", symptom: "MAC1", status: "Blank Display", statusby: "siva" },
      ]
    }
    // Add more users as needed...








  ];




  // Function to display the data for the authenticated user
  function displayUserData(username) {
    var user = userData.find(function(user) {
      return user.username === username;
    });

    if (user) {
      var dataRows = "";
      user.data.forEach(function(data) {
        dataRows += "<tr>";
        dataRows += "<td>" + data.salutation + "</td>";
        dataRows += "<td>" + data.firstName + "</td>";
        dataRows += "<td>" + data.middleName + "</td>";
        dataRows += "<td>" + data.lastName + "</td>";
        dataRows += "<td>" + data.dob + "</td>";
        dataRows += "<td>" + data.nameOnPan + "</td>";
        dataRows += "<td>" + data.pan + "</td>";
        dataRows += "<td>" + data.mobileNumber + "</td>";
        dataRows += "<td>" + data.applicationNo + "</td>";
        dataRows += "<td>" + data.Timestamp + "</td>";
        dataRows += "<td>" + data.MatchStatus + "</td>";
        dataRows += "</tr>";
      });

      $("#myTable").html(dataRows);
      $("#loginForm").hide();
      $("#dataContainer").show();
    }
  }




  // Event handler for login button click
  $("#loginBtn").on("click", function() {
    var username = $("#username").val();
    var password = $("#password").val();

    // Perform basic authentication
    var authenticatedUser = userData.find(function(user) {
      return user.username === username && user.password === password;
    });

    if (authenticatedUser) {
      loggedInUser = username;
      displayUserData(username);
    } else {
      alert("Invalid username or password");
    }
  });



  // Event handler for logout button click
  $("#logoutBtn").on("click", function() {
    loggedInUser = undefined;
    $("#myTable").html(""); // Clear the table
    $("#dataContainer").hide();
    $("#loginForm").show();
    $("#username").val("");
    $("#password").val("");
  });


  // Search functionality (same as before)
  $("#myInput").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#myTable tr").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });







  // Event handler for "Create Form" button click
  $(document).on("click", "#createFormBtn", function() {
    // Get the iframe URL
    var iframeUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSeRYkVtx9aLq4FfWCGbeB4crKuo-dd9z8DjUSO7q-v2KYWLLg/viewform?";

    // Open the URL in a new tab/window
    window.open(iframeUrl, "_blank");
  });
      // Event handler for input change
      document.getElementById('myInput').addEventListener('input', function() {
        var viewBtn = document.getElementById('viewBtn')
        // Enable the button only if the input has text
        viewBtn.disabled = this.value.trim() === "";
      });

    // // Event handler for "view status" button click Get a reference to the button element
//       const viewBtn = document.getElementById('viewBtn');
  // Function to handle the button click
//    document.getElementById('viewBtn').addEventListener('click', function() {

// Event handler for input change
    document.getElementById('myInput').addEventListener('input', function() {
      var viewBtn = document.getElementById('viewBtn');
      // Enable the button only if the input has text
      viewBtn.disabled = this.value.trim() === "";
    });

    // Event handler for "view status" button click
    document.getElementById('viewBtn').addEventListener('click', function() {
    var inputCaseID = document.getElementById('myInput').value.trim();
          // 'script WEB_APP_URL'
      var url = 'https://script.google.com/macros/s/AKfycbzA29vURSVA7n5TTnlxxtC43tCEtotSoLDfmC3ZwM_YLcR6vUQkrbD49viZs4DBHjja/exec';

      fetch(url)
        .then(response => response.json())
        .then(data => {
          var responsesDiv = document.getElementById('responses');
          responsesDiv.innerHTML = ''; // Clear any existing content
           // Filter the data to get only the matched results

                    var filteredData = data.filter(item => item['Case ID'] === inputCaseID);

          // Create the table element
          var table = document.createElement('table');
          table.classList.add('table', 'table-bordered');

          // Create and append the table header row
          var tableHeader = document.createElement('thead');
          var headerRow = document.createElement('tr');

          // Assuming the response data has keys for column names
          Object.keys(data[0]).forEach(key => {
            var headerCell = document.createElement('th');
            headerCell.textContent = key;
            headerRow.appendChild(headerCell);
          });

          tableHeader.appendChild(headerRow);
          table.appendChild(tableHeader);

          // Create and append the table body rows
          var tableBody = document.createElement('tbody');
          filteredData.forEach(response => {
            var bodyRow = document.createElement('tr');
            Object.values(response).forEach(value => {
              var bodyCell = document.createElement('td');
              bodyCell.textContent = value;
              bodyRow.appendChild(bodyCell);
            });
            tableBody.appendChild(bodyRow);
          });

          table.appendChild(tableBody);

          // Append the table to the responsesDiv
          responsesDiv.appendChild(table);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    });




//    // Event handler for "Create Form" button click on pop-up
//    $(document).on("click", "#createFormBtn", function() {
//      var popup = window.open(
//        "",
//        "FormPopup",
//        "width=800,height=600,scrollbars=yes,resizable=yes"
//      );
//
//      var iframeUrl =
//        "https://docs.google.com/forms/d/e/1FAIpQLSeRYkVtx9aLq4FfWCGbeB4crKuo-dd9z8DjUSO7q-v2KYWLLg/viewform?embedded=true";-->
//      var iframe =
//        '<iframe src="' +
//        iframeUrl +
//        '" width="100%" height="100%" style="border:0;"></iframe>';
//
//      popup.document.write(iframe);
//
//      var closePopupBtn =
//        '<button id="closePopupBtn">Close Popup</button>';
//      popup.document.write(closePopupBtn);
//
//      $(popup.document).on("click", "#closePopupBtn", function() {
//        popup.close();
//      });
//    });




    // Function to handle the button click
//    viewBtn.addEventListener('click', function() {
      // Replace 'URL_OF_YOUR_IFRAME' with the actual URL of the iframe content you want to open
//      const iframeURL = 'https://docs.google.com/spreadsheets/d/1m3wrGpcSoO3jNNY9yGFymdr57J3ZC4jbAds9Y47egGU/edit?resourcekey#gid=1185927826';

      // Open the URL in a new tab
//      window.open(iframeURL, '_blank');
//    });

  // Get the IP address using an API
  $.getJSON("https://api.ipify.org?format=json", function(data) {
    var ipAddress = data.ip;
    $("#ipAddress").text(ipAddress);
  });

  // Fetch the hit count from counter.php
//  $.get("counter.php", function(data) {
//     Update the hit count on the webpage
//    $("#hitCount").text("Hit Count: " + data);
//  });
});