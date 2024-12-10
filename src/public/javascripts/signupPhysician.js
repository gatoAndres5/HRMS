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

    let txdata = {
        email: email,
        password: password,
        role: 'Physician',
        name: name
    };

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
            setTimeout(function() {
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
    $('#btnSignUp').click(signup);
});
