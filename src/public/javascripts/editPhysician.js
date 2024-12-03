function isStrongPassword(password) {
    // Regex for password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}
$(document).ready(function () {
    let physicianEmail = '';

    // Fetch the logged-in patient's email dynamically
    function fetchPhysicianEmail() {
        $.ajax({
            url: '/customers/getUserEmail',
            type: 'GET',
            headers: {
                'x-auth': localStorage.getItem('token')
            },
            success: function (response) {
                console.log(response);  // Process response
                physicianEmail = response.email; // Assign the fetched email to patientEmail
            },
            error: function (error) {
                console.log(error);  // Handle error
            }
        });
    }


    // Update message display
    function updateMessage(message) {
        $('#messageBox').text(message).fadeIn().delay(3000).fadeOut();
    }


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
                email: physicianEmail, 
                password: currentPassword 
            }),
            success: function (response) {
                if (response.valid) {
                    // If the current password is correct, proceed to update the password
                    updatePassword(newPassword, currentPassword);
                } else {
                    window.alert(
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
            url: '/customers/updatePassword',
            type: 'PUT',
            headers: {
                'x-auth': localStorage.getItem('token')
            },
            contentType: 'application/json',
            data: JSON.stringify({
                email: physicianEmail,
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

    // Initialize by fetching the patient email
    fetchPhysicianEmail();
});
