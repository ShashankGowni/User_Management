$(document).ready(function () {
    let userData = []; // Store fetched user data
    let dataTable;
    let editingUserId = null; // Store the ID of the user being edite

   

    $.ajax({
        url: 'https://dummyapi.online/api/users',
        method: 'GET',
        success: function (data) {
            userData = data;
            renderTable(userData);
        },
        error: function (error) {
            console.error('Error fetching data:', error);
        }
    });

    // Render DataTable
    function renderTable(data) {
        if ($.fn.dataTable.isDataTable('#userTable')) {
            dataTable.clear(); // Clear existing data
            dataTable.rows.add(data); // Add new data
            dataTable.draw(); // Redraw table
        } else {
            dataTable = $('#userTable').DataTable({
                data: data,
                columns: [
                    {
                        data: 'name',
                        render: function (data, type, row) {
                            return `<a href="#" class="viewDetails username-style" title="${data}"data-id="${row.id}">${data}</a>`;
                        }
                    },
                    { data: 'username' },
                    {
                        data: 'email',
                        render: function (data, type, row) {
                            return `<ul line-style:none; class="email" title="${data}"data-id="${row.id}">${data}</ul>`;
                        }
                    },
                    {
                        data: null,
                        defaultContent: '<button class="editBtn" title ="Edit"></button> <button class="deleteBtn"title ="Delete"></button>',
                    }
                ],
                paging: true,
                searching: false,
                ordering: true,  // Re-enable sorting here if needed
            });
        }
    }
        // Event handler for global search input
        $('#globalSearch').on('input', function () {
            const searchQuery = $(this).val().toLowerCase();
    
            if (searchQuery === '') {
                // If the search box is cleared, display the full user data
                renderTable(userData); // Show the full table
                $('#globalSuggestions').hide(); // Hide suggestions when input is empty
            } else {
                // Filter data based on the search query
                const filteredData = userData.filter(user =>
                    user.name.toLowerCase().includes(searchQuery) ||
                    user.email.toLowerCase().includes(searchQuery) ||
                    user.username.toLowerCase().includes(searchQuery)
                );
    
                // Show the filtered suggestions
                showGlobalSuggestions(filteredData);
    
                // Render the filtered table data
                renderTable(filteredData);
            }
        });
    
        // Hide suggestions if the user clicks outside of the input or suggestions list
        $(document).on('click', function (event) {
            const isClickInside = $(event.target).closest('#globalSearch, #globalSuggestions').length;
            if (!isClickInside) {
                $('#globalSuggestions').hide(); // Hide suggestions when clicking outside
            }
        });

    // Function to show global search suggestions (this function will render suggestions in the <ul> element)
    function showGlobalSuggestions(filteredData) {
        const suggestionsList = $('#globalSuggestions');
        suggestionsList.empty(); // Clear previous suggestions

        // If no data is found, show a "No results" message
        if (filteredData.length === 0) {
            suggestionsList.append('<li>No results found</li>');
        } else {
            filteredData.forEach(user => {
                const listItem = $('<li>').text(`${user.name} - ${user.email} - ${user.username}`);
                listItem.on('click', function () {
                    $('#globalSearch').val(user.name); // Fill input field with the selected suggestion
                    suggestionsList.empty(); // Clear suggestions
                    suggestionsList.hide(); // Hide suggestions list after selection

                    // Filter and render the table based on selected value
                    const filteredData = userData.filter(u =>
                        u.name.toLowerCase().includes(user.name.toLowerCase()) ||
                        u.email.toLowerCase().includes(user.email.toLowerCase()) ||
                        u.username.toLowerCase().includes(user.username.toLowerCase())
                    );
                    renderTable(filteredData);
                });
                suggestionsList.append(listItem);
            });
        }

        suggestionsList.show(); // Show the suggestions list
    }

    function showSuggestions(inputSelector, filteredData, field) {
        // Determine which suggestion list to show based on the inputSelector
        let suggestionList;
        if (inputSelector === '#nameSearch') {
            suggestionList = $('#nameSuggestions');
        } else if (inputSelector === '#emailSearch') {
            suggestionList = $('#emailSuggestions');
        } else {
            suggestionList = $('#usernameSuggestions');
        }

        suggestionList.empty(); // Clear previous suggestions
        // If there are matching results, show them
        if (filteredData.length > 0) {
            filteredData.forEach(user => {
                const suggestionItem = `<li class="suggestion-item" data-value="${user[field]}">${user[field]}</li>`;
                suggestionList.append(suggestionItem);
            });
            suggestionList.show();
        } else {
            suggestionList.hide();
        }
    }
    


    // Handle input in the search fields and dynamically update table and suggestions
    // Autocomplete for Search by Name
    $('#nameSearch').on('input', function () {
        const searchQuery = $(this).val().toLowerCase();
        if (searchQuery === '') {
            $('#nameSuggestions').hide(); // Hide suggestions when input is cleared
            renderTable(userData); // Show full data when cleared
        } else {

            const filteredData = userData.filter(user =>
                user.name.toLowerCase().includes(searchQuery)
            );

            showSuggestions('#nameSearch', filteredData, 'name');
            renderTable(filteredData);
        }
    });

    // Autocomplete for Search by Email
    $('#emailSearch').on('input', function () {
        const searchQuery = $(this).val().toLowerCase();
        if (searchQuery === '') {
            $('#emailSuggestions').hide(); // Hide suggestions when input is cleared
            renderTable(userData); // Show full data when cleared
        } else {
            const filteredData = userData.filter(user =>
                user.email.toLowerCase().includes(searchQuery)
            );
            showSuggestions('#emailSearch', filteredData, 'email');
            renderTable(filteredData);
        }
    });

    // Autocomplete for Search by Username
    $('#usernameSearch').on('input', function () {
        const searchQuery = $(this).val().toLowerCase();
        if (searchQuery === '') {
            $('#usernameSuggestions').hide();
            renderTable(userData);
        } else {
            const filteredData = userData.filter(user =>
                user.username.toLowerCase().includes(searchQuery)
            );
            showSuggestions('#usernameSearch', filteredData, 'username');
            renderTable(filteredData);
        }

    });


    $('body').on('click', '.suggestion-item', function () {
        const selectedValue = $(this).data('value');
        const suggestionListId = $(this).closest('ul').attr('id'); // Get the suggestion list ID
        let inputSelector;

        // Determine the input field based on the suggestion list ID
        if (suggestionListId === 'usernameSuggestions') {
            inputSelector = '#usernameSearch';
        } else if (suggestionListId === 'nameSuggestions') {
            inputSelector = '#nameSearch';
        } else if (suggestionListId === 'emailSuggestions') {
            inputSelector = '#emailSearch';
        }

        // Update the input field with the selected value and hide the suggestions list
        $(inputSelector).val(selectedValue);
        $(this).closest('ul').hide();

        // Filter data based on selected value
        let filteredData = [];
        // Filter data based on selected value
        if (inputSelector === '#usernameSearch') {
            filteredData = userData.filter(user =>
                //user.username.toLowerCase() === selectedValue.toLowerCase()
                user.username.toLowerCase().startsWith(selectedValue.toLowerCase())
            );
            // renderTable(filteredData);
        } else if (inputSelector === '#nameSearch') {
            filteredData = userData.filter(user =>
                //user.name.toLowerCase() === selectedValue.toLowerCase()
                user.name.toLowerCase().startsWith(selectedValue.toLowerCase())
            );
            // renderTable(filteredData);
        } else if (inputSelector === '#emailSearch') {
            filteredData = userData.filter(user =>
                user.email.toLowerCase().startsWith(selectedValue.toLowerCase())
            );
            // renderTable(filteredData);
        }
        renderTable(filteredData);
    });


    $('body').on('click', function (e) {
        if (!$(e.target).closest('#usernameSearch, #usernameSuggestions').length) {
            $('#usernameSuggestions').hide();
        }
        if (!$(e.target).closest('#nameSearch, #nameSuggestions').length) {
            $('#nameSuggestions').hide();
        }
        if (!$(e.target).closest('#emailSearch, #emailSuggestions').length) {
            $('#emailSuggestions').hide();
        }
    });

    // Show User Details Modal when Name is Clicked
    $('#userTable').on('click', '.viewDetails', function (e) {
        e.preventDefault();

        const rowData = dataTable.row($(this).closest('tr')).data();
        $('#modalUserName').text(rowData.name);
        $('#modalUserUsername').text(rowData.username);
        $('#modalUserEmail').text(rowData.email);
        $('#modalUserAddress').text(`${rowData.address.street}, ${rowData.address.city}, ${rowData.address.state}, ${rowData.address.zipcode}`);

        // Display the current profile picture or default if not available
        $('#profilePicture').attr('src', rowData.profilePic || generateRandomProfilePic());

        // Store the user ID in the modal for later reference
        $('#userDetailsModal').data('userId', rowData.id);

        // Show the modal
        $('#userDetailsModal').show();
    });

    // Close User Details Modal
    $('#closeUserDetailsModal').on('click', function () {
        $('#userDetailsModal').hide();
    });
   

    // Handle clicking on the row to show address below it
    $("#userTable").on("click", "tr", function (e) {
        // Check if the clicked element is not the name link (we don't want to trigger this when the name is clicked)
        if (!$(e.target).hasClass("viewDetails")) {
          const rowData = dataTable.row(this).data();
     
          // Hide any previously shown address row (except for the clicked row's address row)
          $(".addressRow").not($(this).next(".addressRow")).hide();
     
          // Check if the address row already exists for the clicked row
          const existingAddressRow = $(this).next(".addressRow");
          if (existingAddressRow.length) {
            // If the address row exists, toggle its visibility
            existingAddressRow.toggle();
          } else {
            // If no address row exists, create and insert the new address row below the clicked row
            const addressRow = `
              <div class="addressRow">
                <legend>Address :</legend>
                <table class="address-table">
                  <thead>
                    <tr>
                      <th>Street</th>
                      <th>City</th>
                      <th>State</th>
                      <th>Zip Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${rowData.address.street}</td>
                      <td>${rowData.address.city}</td>
                      <td>${rowData.address.state}</td>
                      <td>${rowData.address.zipcode}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `;
            $(this).after(addressRow); // Insert the address row below the clicked row
          }
        }
      });

    // Handle Profile Picture Upload Button
    $('#uploadCustomProfilePic').on('click', function () {
        $('#chooseFile').click(); // Trigger the file input click event
    });

    // Handle Profile Picture file selection
    $('#chooseFile').on('change', function (event) {
        const file = event.target.files[0]; // Get the selected file
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                // Display the selected image in the profile picture area
                $('#profilePicture').attr('src', e.target.result);
            };
            reader.readAsDataURL(file); // Read the file as a data URL
        }
    });

    // Save the uploaded profile picture
    $('#saveProfilePic').on('click', function () {
        const userId = $('#userDetailsModal').data('userId'); // Get the ID of the user being edited
        const selectedFile = $('#chooseFile')[0].files[0]; // Get the selected file from the input
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = function (e) {
                // Find the user in the userData array
                const updatedUser = userData.find(user => user.id === userId);
                updatedUser.profilePic = e.target.result; // Save the profile picture to the user

                // Close the modal
                $('#userDetailsModal').hide();

                // Re-render the table to reflect the updated profile picture
                renderTable(userData);
            };
            reader.readAsDataURL(selectedFile); // Read the file and save it
        } else {
            alert('Please select a file to upload.');
        }
    });

    // Add/Edit User Modal Handling
    $('#addRowBtn').on('click', function () {
        $('#addRowModal').show();
        $('#modalBackdrop').show();
        editingUserId = null; // Reset editing user
        clearAddEditForm(); // Clear form for new user
    });
    // Function to clear Add/Edit form
    function clearAddEditForm() {
        $('#newName').val('');
        $('#newUsername').val('');
        $('#newEmail').val('');
        $('#newStreet').val('');
        $('#newCity').val('');
        $('#newState').val('');
        $('#newZipcode').val('');
    }

    // Cancel Add/Edit Modal
    $('#cancelAddRow').on('click', function () {
        $('#addRowModal').hide();
        $('#modalBackdrop').hide();
    });

    // Submit Add/Edit User
    $('#submitAddRow').on('click', function () {
        //Check if any required fields are empty
        const name = $('#newName').val().trim();
        const username = $('#newUsername').val().trim();
        const email = $('#newEmail').val().trim();
        const street = $('#newStreet').val().trim();
        const city = $('#newCity').val().trim();
        const state = $('#newState').val().trim();
        const zipcode = $('#newZipcode').val().trim();

        const pattern = /^[A-Za-z0-9]+$/;  // For name and username
    const pattern1 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  // For email
    const patternStreetCityState = /^[a-zA-Z0-9\s,]+$/;  // For street, city, and state
    const patternZipcode = /^\d{5}(-\d{4})?$/;  // For zipcode (5 digits or 9 digits with a dash)
// Function to display the pop-up with a message
function showPopup(message) {
    $('#popup-message').text(message);  // Set the message text inside the pop-up
    $('#popup').fadeIn();  // Show the pop-up with a fade-in effect
}

// Function to close the pop-up
$('#close-popup').click(function() {
    $('#popup').fadeOut();  // Hide the pop-up with a fade-out effect
});
if (!name || !username || !email || !street || !city || !state || !zipcode) {
    showPopup("Please fill in all the fields.");
    return; // Stop the form submission
}

// Name validation (should contain only letters and numbers)
else if (!pattern.test(name)) {
    showPopup("Name should contain only alphabets and numbers.");
    return;
}

// Username validation (should contain only letters, numbers, no spaces)
else if (!pattern.test(username)) {
    showPopup("Username should contain only alphabets and numbers, no spaces or special characters.");
    return;
}

// Validate Email
else if (!pattern1.test(email)) {
    showPopup("Please enter a valid email address.");
    return;
}

// Validate Street, City, and State (only alphanumeric and spaces, commas allowed)
else if (!patternStreetCityState.test(street)) {
    showPopup("Street address can only contain letters, numbers, spaces, and commas.");
    return;
}
else if (!patternStreetCityState.test(city)) {
    showPopup("City name can only contain letters, numbers, and spaces.");
    return;
}
else if (!patternStreetCityState.test(state)) {
    showPopup("State name can only contain letters, numbers, and spaces.");
    return;
}

// Validate Zipcode (5 digits or 9 digits with a dash)
else if(!patternZipcode.test(zipcode)) {
    showPopup("Please enter a valid zipcode (5 digits or 9 digits with a dash).");
    return;
}
showPopup("Form submitted successfully!");
// Check if any fields are empty


     
        // Create the new user object from the form data
        const newUser = {
            id: editingUserId ? editingUserId : userData.length + 1,
            name: $('#newName').val(),
            username: $('#newUsername').val(),
            email: $('#newEmail').val(),
            address: {
                street: $('#newStreet').val(),
                city: $('#newCity').val(),
                state: $('#newState').val(),
                zipcode: $('#newZipcode').val()
            }
        };

        // Step 2: Either update the existing user or add the new user at the top
        if (editingUserId) {
            // Update existing user
            const userIndex = userData.findIndex(user => user.id === editingUserId);
            userData[userIndex] = newUser;
        } else {
            // Add the new user at the top of the array using unshift
            userData.unshift(newUser);
        }


        // Step 3: Disable sorting temporarily before rendering the table
        dataTable.order([]); // Disable sorting

        // Step 4: Clear the DataTable and add the updated user data
        dataTable.clear();  // Clear existing rows from the DataTable
        dataTable.rows.add(userData);  // Add the updated user data to the table
        dataTable.draw();  // Redraw the table to reflect the changes

        // Step 5: Re-enable sorting after rendering the table (if needed)
       // dataTable.order([0, 'asc']); // Re-enable sorting on the first column (you can change this if needed)

        // Step 6: Close the modal
        $('#addRowModal').hide();
        $('#modalBackdrop').hide();
    });

    // Edit User
    $('#userTable').on('click', '.editBtn', function () {
        const rowData = dataTable.row($(this).closest('tr')).data();
        editingUserId = rowData.id;

        // Populate form with user data for editing
        $('#newName').val(rowData.name);
        $('#newUsername').val(rowData.username);
        $('#newEmail').val(rowData.email);
        $('#newStreet').val(rowData.address.street);
        $('#newCity').val(rowData.address.city);
        $('#newState').val(rowData.address.state);
        $('#newZipcode').val(rowData.address.zipcode);

        $('#addRowModal').show();
        $('#modalBackdrop').show();
    });
    $('#clear').click(function(){
        $('#nameSearch').val('');
        $('#emailSearch').val('');
        $('#usernameSearch').val('');
        $('#globalSearch').val('');
        renderTable(userData);
    });



    $('#userTable').on('click', '.deleteBtn', function () {
        const rowData = dataTable.row($(this).closest('tr')).data();
        
        // Set the confirmation message dynamically
        $('#confirmMessage').text(`Are you sure you want to delete ${rowData.name}?`);
        
        // Show the modal
        $('#confirmModal').fadeIn();
    
        // Handle "Yes" click
        $('#confirmYes').off('click').on('click', function() {
            // Remove the user from the data
            userData = userData.filter(user => user.id !== rowData.id);
            renderTable(userData); // Re-render the table
            
            // Close the modal
            $('#confirmModal').fadeOut();
        });
    
        // Handle "No" click
        $('#confirmNo').off('click').on('click', function() {
            // Close the modal without deleting the user
            $('#confirmModal').fadeOut();
        });
    });
    
    // Close the modal if user clicks anywhere outside the modal content
    $(window).on('click', function(event) {
        if ($(event.target).is('#confirmModal')) {
            $('#confirmModal').fadeOut();
        }
    });
    

    // Export Data based on the selected format
    $('#exportBtn').on('click', function () {
        const selectedFormat = $('#fileFormatSelect').val(); // Get the selected format

        // Get all rows data
        const allData = dataTable.rows().data().toArray();

        // Ensure sequential IDs and flatten address for export
        const updatedData = allData.map((row, index) => {
            row.id = index + 1;
            row.address = `${row.address.street}, ${row.address.city}, ${row.address.state}, ${row.address.zipcode}`;
            return row;
        });

        switch (selectedFormat) {
            case 'excel':
                exportToExcel(updatedData);
                break;
            case 'csv':
                exportToCSV(updatedData);
                break;
            case 'pdf':
                exportToPDF(updatedData);
                break;
            case 'txt':
                exportToTXT(updatedData);
                break;
            default:
                alert('Please select a valid format.');
        }
    });
    // Export to Excel
    function exportToExcel(data) {
        const ws = XLSX.utils.json_to_sheet(data); // Convert JSON data to Excel sheet format
        const wb = XLSX.utils.book_new(); // Create a new workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Users'); // Append the sheet to the workbook
        XLSX.writeFile(wb, 'users.xlsx'); // Trigger file download
    }

    function exportToCSV(data) {
        // Ensure that the address field is included, and if missing, add an empty string or a placeholder like "N/A"
        const formattedData = data.map(row => {
            // If the address is missing, set it to a default value (e.g., "N/A")
            if (!row.hasOwnProperty('address')) {
                row.address = 'N/A';  // Add placeholder text for missing address
            }
            return row;
        });
    
        // Convert JSON data to CSV format using Papa.unparse()
        const csv = Papa.unparse(formattedData); // Convert to CSV
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); // Create CSV blob
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob); // Create a URL for the blob
        link.download = 'users.csv'; // Set the file name for download
        link.click(); // Trigger the file download
    }
    

    function exportToPDF(data) {
        const { jsPDF } = window.jspdf;  // Ensure jsPDF is available
        const doc = new jsPDF();  // Create a new jsPDF instance
    
        // Define the columns for the table (headers)
        const columns = ['ID', 'Name', 'Username', 'Email', 'Address'];
    
        // Map your data into rows that will be inserted into the table
        const tableData = data.map(user => {
            const address = user.address ? `${user.address.street}, ${user.address.city}` : 'N/A';  // Check if address exists
            return [
                user.id,
                user.name,
                user.username,
                user.email,
                user.address  // Ensure address is correctly formatted or use 'N/A'
            ];
        });
    
        // Use autoTable to generate the table in the PDF
        doc.autoTable({
            head: [columns], // Table headers
            body: tableData, // Table rows (user data)
            startY: 20,  // Starting position of the table (Y-axis)
            margin: { top: 20 },  // Add some margin to the top of the page
            theme: 'striped'  // Optional: use striped theme for table rows
        });
    
        // Save the generated PDF with a filename
        doc.save('users.pdf');
    }
    
    
    function exportToTXT(data) {
        data.forEach(user => {
            console.log('User Address:', user.address);  // Log the address field to check its structure
        });
    
        const txt = data.map(user => {
            // Check if the address exists and if it's correctly structured
            const address = user.address && user.address.street && user.address.city
                ? `${user.address.street}, ${user.address.city}` 
                : 'Address not available';  // Fallback if address is not present
    
            return `ID: ${user.id}\nName: ${user.name}\nUsername: ${user.username}\nEmail: ${user.email}\nAddress: ${user.address}\naddress`;
        }).join('');
    
        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob); // Create a URL for the TXT blob
        link.download = 'users.txt'; // Set the download filename
        link.click(); // Trigger the file download
    }
    
    

    // Function to generate random profile picture
    function generateRandomProfilePic() {
        const randomIndex = Math.floor(Math.random() * 100); // Generate random number between 0-99
        return `https://randomuser.me/api/portraits/men/${randomIndex}.jpg`; // Random image from randomuser.me
    }


});