function login() {
    let email = $('#email').val().trim();
    let password = $('#password').val().trim();

    // Validate fields
    if (!email || !password) {
        let msg = !email ? "Email is required." : "Password is required.";
        showError(msg);
        return;
    }

    let txdata = {
        email: email,
        password: password
    };

    $.ajax({
        url: '/users/logIn',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) {
        localStorage.setItem("token", data.token);
        console.log(data); // Log the server response

        if (data.role === "Patient") {
            window.location.replace("patientAccount.html");
        } else if (data.role === "Physician") {
            window.location.replace("physicianAccount.html");
        } else {
            window.location.replace("patientAccount.html"); // Fallback page
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        let errorMsg = jqXHR.responseJSON ? jqXHR.responseJSON.error || "Login failed. Please try again." : "An unexpected error occurred.";
        showError(errorMsg);
    });
}

function showError(message) {
    $('#errorMsg').text(message).show();
}

$(function () {
    $('#btnLogIn').click(login);
});
