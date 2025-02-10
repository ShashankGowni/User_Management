$(document).ready(function () {
    // Call the fetchData function and pass the callback to render the table
    fetchData(function (userData) {
        renderTable(userData);
    });
    setupGlobalSearch(function(filteredData) {
        renderTable(filteredData);
    });
});
// Function to fetch user data
function fetchData(callback) {
    $.ajax({
        url: 'https://dummyapi.online/api/users',
        method: 'GET',
        success: function (data) {
            // Pass the fetched data to the callback
            callback(data);
        },
        error: function (error) {
            console.error('Error fetching data:', error);
        }
    });
}

// Function to render the DataTable
function renderTable(data) {
    let dataTable;
    
    if ($.fn.dataTable.isDataTable('#userTable')) {
        // If DataTable already exists, clear and update data
        dataTable.clear();
        dataTable.rows.add(data);
        dataTable.draw();
    } else {
        // If DataTable does not exist, initialize it
        dataTable = $('#userTable').DataTable({
            data: data,
            columns: [
                {
                    data: 'name',
                    render: function (data, type, row) {
                        return `<a href="#" class="viewDetails username-style" title="${data}" data-id="${row.id}">${data}</a>`;
                    }
                },
                { data: 'username' },
                {
                    data: 'email',
                    render: function (data, type, row) {
                        return `<ul style="list-style:none" title="${data}" data-id="${row.id}">${data}</ul>`;
                    }
                },
                {
                    data: null,
                    defaultContent: '<button class="editBtn" title="Edit"></button> <button class="deleteBtn" title="Delete"></button>'
                }
            ],
            paging: true,
            searching: false,
            ordering: true, // Re-enable sorting here if needed
        });
    }
}
