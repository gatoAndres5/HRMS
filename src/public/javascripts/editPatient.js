function isStrongPassword(password) {
    // Regex for password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}
$(document).ready(function () {
    let patientEmail = '';
    let devices = [];

    // Fetch the logged-in patient's email dynamically
    function fetchPatientEmail() {
        $.ajax({
            url: '/customers/getUserEmail',
            type: 'GET',
            headers: {
                'x-auth': localStorage.getItem('token')
            },
            success: function (response) {
                console.log(response);  // Process response
                patientEmail = response.email; // Assign the fetched email to patientEmail
                loadDevices();  // Now that email is set, load devices
            },
            error: function (error) {
                console.log(error);  // Handle error
            }
        });
    }

    // Load devices from the server
    function loadDevices() {
        if (!patientEmail) {
            console.log('Patient email is not set.');
            return; // Ensure email is set before making the request
        }

        $.ajax({
            url: '/customers/getDevices', // Endpoint for fetching devices
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
                    ${device.type} - ${device.name}
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
        $('#newDeviceType').val('');
        $('#newDeviceName').val('');
    }

    // Add new device
    $('#btnAddNewDevice').click(function () {
        const type = $('#newDeviceType').val().trim();
        const name = $('#newDeviceName').val().trim();

        if (!type || !name) {
            updateMessage("Both type and name are required for a new device.");
            return;
        }

        const newDevices = [...devices, { type, name }];

        $.ajax({
            url: '/customers/updateDevices',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                email: patientEmail,
                devices: newDevices
            }),
            success: function (response) {
                devices.push({ type, name });
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
            url: '/customers/updateDevices',
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
            window.alert(
                "Invalid password! Your password must be at least 8 characters long, " +
                "and include an uppercase letter, a lowercase letter, a number, and a special character."
            );
            return;
        }
    
        $.ajax({
            url: '/customers/validatePassword', // Endpoint for validating the current password
            type: 'POST',
            headers: {
                'x-auth': localStorage.getItem('token')
            },
            contentType: 'application/json',
            data: JSON.stringify({ 
                email: patientEmail, 
                password: currentPassword 
            }),
            success: function (response) {
                if (response.valid) {
                    // If the current password is correct, proceed to update the password
                    updatePassword(newPassword);
                } else {
                    updateMessage("Current password is incorrect.");
                }
            },
            error: function (error) {
                updateMessage(error.responseJSON?.msg || "An error occurred while validating the password.");
            }
        });
    });
    
    // Function to update the password
    function updatePassword(newPassword) {
        $.ajax({
            url: '/customers/updatePassword',
            type: 'PUT',
            headers: {
                'x-auth': localStorage.getItem('token')
            },
            contentType: 'application/json',
            data: JSON.stringify({
                email: patientEmail,
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

    // Initialize by fetching the patient email
    fetchPatientEmail();
});
