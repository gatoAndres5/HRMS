$(function () {
    $('#btnLogOut').click(logout);

    // Fetch the logged-in user's details
    $.ajax({
        url: '/customers/status', // Endpoint to fetch physician details
        method: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("token") },
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) {
        console.log("Response Data: ", data); // Add this log to ensure we are receiving the data
        displayPhysicianPatients(data); // Ensure this function gets called
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        console.error("Failed to fetch physician details:", errorThrown);
        window.location.replace("display.html");
    });
    
});

function logout() {
    localStorage.removeItem("token");
    window.location.replace("index.html");
}

// Function to display the patient's field
function displayPhysicianPatients(data) {
    console.log("Received data: ", data); // Log the full data response to verify the structure

    const physicianName = data.name || "Unknown"; // Fallback in case name is missing
    const patients = data.patients || []; // Fallback to an empty array if no patients exist
    const patientsList = $('#patientsList');

    $('#physicianName').text("Patients:");
    console.log("Patients: ", patients); // Log patients array to see its contents

    if (patients.length > 0) {
        const patientsHtml = patients.map(patient => `<li class="list-group-item">${patient}</li>`).join('');
        patientsList.html(`<ul class="list-group">${patientsHtml}</ul>`);
    } else {
        patientsList.html('<p>No patients assigned.</p>');
    }
}



