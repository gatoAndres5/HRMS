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
    console.log("Devices collected:", devices);  // Check the structure here
    return devices;
}

function signup() {
    const email = $('#email').val().trim();
    const password = $('#password').val().trim();
    const name = $('#name').val();

    // Email validation
    if (!isValidEmail(email)) {
        window.alert("Invalid email! Please provide a valid email address.");
        return;
    }

    // Password validation
    if (!isStrongPassword(password)) {
        window.alert(
            "Invalid password! Your password must be at least 8 characters long, " +
            "and include an uppercase letter, a lowercase letter, a number, and a special character."
        );
        return;
    }

    // Collect devices
    const devices = collectDevices();
    console.log(devices)

    // Ensure at least one device is added
    if (devices.length === 0) {
        window.alert("Please add at least one device.");
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
    console.log("Data being sent:", txdata);
    // Make AJAX request
    $.ajax({
        url: '/customers/signUp',
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
            }, 10000);
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 404) {
            $('#rxData').html("Server could not be reached!!!");
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


