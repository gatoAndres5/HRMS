function isStrongPassword(password) {
    // Regex for password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}
$(document).ready(function () {
    let patientEmail = '';
    let devices = [];
    let assignedPhysician = ''; // Store the assigned physician's name

    // Fetch the logged-in patient's email dynamically
    function fetchPatientEmail() {
        $.ajax({
            url: '/users/getUserEmail',
            type: 'GET',
            headers: {
                'x-auth': localStorage.getItem('token')
            },
            success: function (response) {
                patientEmail = response.email; // Assign the fetched email to patientEmail
                loadDevices();  // Now that email is set, load devices
                loadAssignedPhysician(); // Load the assigned physician
            },
            error: function (error) {
                console.log(error);  // Handle error
            }
        });
    }

    // Load devices from the server
    function loadDevices() {
        if (!patientEmail) {
            return; // Ensure email is set before making the request
        }

        $.ajax({
            url: '/users/getDevices', // Endpoint for fetching devices
            type: 'GET',
            data: { email: patientEmail }, // Pass email to server if necessary
            success: function (response) {
                devices = response.devices || [];
                renderDevices();
            },
            error: function (error) {
                updateMessage('Failed to load devices.');
                console.error(error);
            }
        });
    }

    // Render the device list
    function renderDevices() {
        $('#deviceList').empty();
        devices.forEach((device, index) => {
            $('#deviceList').append(`
                <li>
                    Device Id: ${device.id} - Access Token: jm${device.accessToken}
                    <button class="removeDeviceBtn" data-index="${index}">Remove</button>
                </li>
            `);
        });
    }

    // Update message display
    function updateMessage(message) {
        $('#messageBox').text(message).fadeIn().delay(3000).fadeOut();
    }

    // Clear new device fields
    function clearNewDeviceFields() {
        $('#newDeviceId').val('');
        $('#newDeviceAT').val('');
    }

    // Add new device
    $('#btnAddNewDevice').click(function () {
        const id = $('#newDeviceId').val().trim();
        const accessToken = $('#newDeviceAT').val().trim();

        if (!id || !accessToken) {
            updateMessage("Both id and acccess token are required for a new device.");
            return;
        }

        const newDevices = [...devices, { id, accessToken }];

        $.ajax({
            url: '/users/updateDevices',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                email: patientEmail,
                devices: newDevices
            }),
            success: function (response) {
                devices.push({ id, accessToken });
                renderDevices();
                clearNewDeviceFields();
                updateMessage(response.msg);
            },
            error: function (error) {
                updateMessage(error.responseJSON?.msg || "An error occurred while adding the device.");
            }
        });
    });

    // Remove device
    $('#deviceList').on('click', '.removeDeviceBtn', function () {
        const index = $(this).data('index');
        devices.splice(index, 1);

        $.ajax({
            url: '/users/updateDevices',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                email: patientEmail,
                devices: devices
            }),
            success: function (response) {
                renderDevices();
                updateMessage(response.msg);
            },
            error: function (error) {
                updateMessage(error.responseJSON?.msg || "An error occurred while removing the device.");
            }
        });
    });

    // Change password
    $('#btnChangePassword').click(function () {
        const currentPassword = $('#currentPassword').val().trim();
        const newPassword = $('#newPassword').val().trim();
    
        if (!currentPassword || !newPassword) {
            updateMessage("Both current and new passwords are required.");
            return;
        }
    
        // Password validation
        if (!isStrongPassword(newPassword)) {
            updateMessage(
                "Invalid new password! Your password must be at least 8 characters long, " +
                "and include an uppercase letter, a lowercase letter, a number, and a special character."
            );
            return;
        }
    
        $.ajax({
            url: '/users/validatePassword', // Endpoint for validating the current password
            type: 'POST',
            headers: {
                'x-auth': localStorage.getItem('token')
            },
            contentType: 'application/json',
            data: JSON.stringify({ 
                email: patientEmail, 
                password: currentPassword,
            }),
            success: function (response) {
                if (response.valid) {
                    // If the current password is correct, proceed to update the password
                    updatePassword(newPassword, currentPassword);
                } else {
                    updateMessage(
                        "Invalid password! Your password must be at least 8 characters long, " +
                        "and include an uppercase letter, a lowercase letter, a number, and a special character."
                    );
                    updateMessage("Current password is incorrect.");
                }
            },
            error: function (error) {
                updateMessage(error.responseJSON?.msg || "An error occurred while validating the password.");
            }
        });
    });
    
    // Function to update the password
    function updatePassword(newPassword, currentPassword) {
        $.ajax({
            url: '/users/updatePassword',
            type: 'PUT',
            headers: {
                'x-auth': localStorage.getItem('token')
            },
            contentType: 'application/json',
            data: JSON.stringify({
                email: patientEmail,
                currentPassword: currentPassword,
                newPassword: newPassword
            }),
            success: function (response) {
                updateMessage(response.msg);
                $('#currentPassword').val('');
                $('#newPassword').val('');
            },
            error: function (error) {
                updateMessage(error.responseJSON?.msg || "An error occurred while changing the password.");
            }
        });
    }
    // Load the assigned physician for the patient
    function loadAssignedPhysician() {
        $.ajax({
            url: '/users/getAssignedPhysician', // Endpoint to fetch the assigned physician
            type: 'GET',
            headers: {
                'x-auth': localStorage.getItem('token') // Using a token for authentication
            },
            data: { email: patientEmail }, // Pass email to fetch assigned physician
            success: function (response) {
                assignedPhysician = response.physician || ''; // Set the assigned physician
                loadPhysicians(); // Now load the physician list
            },
            error: function (error) {
                console.error(error);
            }
        });
    }
 // Load physicians from the server
 function loadPhysicians() {
    $.ajax({
        url: '/users/getPhysicians', // Endpoint to get the physicians
        type: 'GET',
        headers: {
            'x-auth': localStorage.getItem('token') // Using a token for authentication
        },
        success: function (response) {
            const physicians = response.physicians || [];
            renderPhysicians(physicians);
        },
        error: function (error) {
            updateMessage('Failed to load physicians.');
            console.error(error);
        }
    });
}

// Render the physician list
function renderPhysicians(physicians) {
    $('#physicianList').empty();
    physicians.forEach((physician) => {
        const checked = physician.name === assignedPhysician ? 'checked' : ''; // Check the assigned physician
        $('#physicianList').append(`
            <li class="list-group-item">
                <input type="radio" name="physician" value="${physician.name}" id="physician_${physician.email}" ${checked}>
                <label for="physician_${physician.email}">${physician.name}</label>
            </li>
        `);
    });

    // Show the assign button if physicians are available
    if (physicians.length > 0) {
        $('#btnAssignPhysician').show();
    } else {
        $('#btnAssignPhysician').hide();
    }
}

// Assign the selected physician to the patient
$('#btnAssignPhysician').click(function () {
    const selectedPhysicianName = $('input[name="physician"]:checked').val(); // Get the selected physician's name
    if (!selectedPhysicianName) {
        updateMessage('Please select a physician.');
        return;
    }
    $.ajax({
        url: '/users/assignPhysician',
        type: 'PUT',
        contentType: 'application/json',
        headers: {
            'x-auth': localStorage.getItem('token') // Assuming you're using a token for authentication
        },
        data: JSON.stringify({
            email: patientEmail, // Make sure `patientEmail` is set correctly
            physicianName: selectedPhysicianName // Send physician's name instead of email or id
        }),
        success: function (response) {
            updateMessage(response.msg); // Assuming `response.msg` holds a success message
        },
        error: function (error) {
            updateMessage(error.responseJSON?.msg || 'An error occurred while assigning the physician.');
        }
    });
});
    // Initialize by fetching the patient email
    fetchPatientEmail();
});
