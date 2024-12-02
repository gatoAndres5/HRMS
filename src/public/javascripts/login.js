// public/javasciprts/login.js
function login() {
    let txdata = {
        email: $('#email').val(),
        password: $('#password').val()
    };
    $.ajax({
        url: '/customers/logIn',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) {
        localStorage.setItem("token", data.token);
        // Log the server response
        console.log(data);
        
        if (data.role === "Patient") {
            window.location.replace("account.html");
        } else if (data.role === "Physician") {
            window.location.replace("physicianAccount.html");
        } else {
            window.location.replace("account.html"); // Fallback page
        }
        
    })
    
    .fail(function (jqXHR, textStatus, errorThrown) {
        $('#rxData').html(JSON.stringify(jqXHR, null, 2));
    });
}

$(function () {
    $('#btnLogIn').click(login);
});