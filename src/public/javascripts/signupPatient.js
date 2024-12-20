function isValidEmail(email) {
    // Regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isStrongPassword(password) {
    // Regex for password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

function isValidName(name) {
    // Check if name is not empty and doesn't contain any numbers
    return name.trim() !== "" && !/\d/.test(name); // Rejects any name with digits
}

function collectDevices() {
    const devices = [];
    $(".device-entry").each(function () {
        const deviceId = $(this).find(".deviceId").val().trim();
        const deviceAT = $(this).find(".deviceAT").val().trim();

        // Validate that both fields are provided
        if (deviceId && deviceAT) {
            devices.push({
                id: deviceId,
                accessToken: deviceAT
            });
        }
    });
    return devices;
}

function showError(message) {
    // Display the error message in the page
    $('#errorMessage').text(message).show();
}

function signup() {
    const email = $('#email').val().trim();
    const password = $('#password').val().trim();
    const name = $('#name').val().trim();

    // Clear previous error messages
    $('#errorMessage').hide();

    // Email validation
    if (!isValidEmail(email)) {
        showError("Invalid email! Please provide a valid email address.");
        return;
    }

    // Password validation
    if (!isStrongPassword(password)) {
        showError(
            "Invalid password! Your password must be at least 8 characters long, " +
            "and include an uppercase letter, a lowercase letter, a number, and a special character."
        );
        return;
    }

    // Name validation
    if (!isValidName(name)) {
        showError("Invalid name! Name cannot be empty or contain numbers.");
        return;
    }

    // Collect devices
    const devices = collectDevices();

    // Ensure at least one device is added
    if (devices.length === 0) {
        showError("Please add at least one device.");
        return;
    }

    // Prepare data for the request
    const txdata = {
        email: email,
        password: password,
        role: 'Patient',
        devices: devices, // Pass the array of devices
        physicians: "None",
        name: name
    };
    // Make AJAX request
    $.ajax({
        url: '/users/signUp',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) {
        $('#rxData').html(JSON.stringify(data, null, 2));
        if (data.success) {
            // After 1 second, move to "login.html"
            setTimeout(function () {
                window.location = "login.html";
            }, 1000);
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 404) {
            $('#rxData').html("Server could not be reached!!!");
        } else if (jqXHR.status === 401) {
            // Handle the case where the email is already used
            showError("This email is already used. Please choose another one.");
        } else {
            $('#rxData').html(JSON.stringify(jqXHR, null, 2));
        }
    });
}

$(function () {
    // Add new device input fields dynamically
    $("#btnAddDevice").click(function () {
        const deviceFields = `
            <div class="device-entry">
              <hr>
              <div class="form-group">
                <label for="deviceId">Device Id: </label>
                <input type="text" class="form-control deviceId" placeholder="Enter device id">
              </div>
              <div class="form-group">
                <label for="deviceAT">Device Access Token: </label>
                <input type="text" class="form-control deviceAT" placeholder="Enter device access token">
              </div>
            </div>`;
        $("#deviceList").append(deviceFields);
    });

    // Attach the signup handler
    $('#btnSignUp').click(signup);
});
