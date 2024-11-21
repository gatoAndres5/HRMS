// public/javascripts/signup.js

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

function signup() {
    const email = $('#email').val();
    const password = $('#password').val();
    

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

    let txdata = {
        email: email,
        password: password,
        role: 'Patient'
    };

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
            setTimeout(function() {
                window.location = "login.html";
            }, 1000);
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status == 404) {
            $('#rxData').html("Server could not be reached!!!");    
        } else {
            $('#rxData').html(JSON.stringify(jqXHR, null, 2));
        }
    });
}

$(function () {
    $('#btnSignUp').click(signup);
});
