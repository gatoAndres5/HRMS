$(function () {

    // Fetch the logged-in user's details
    $.ajax({
        url: '/users/status', // Endpoint to fetch physician details
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

// Function to display the physician's patients and their hardcoded stats
function displayPhysicianPatients(data) {
    console.log("Received data: ", data); // Debugging

    const physicianName = data.name || "Unknown";
    const patients = data.patients || [];
    const patientsList = $('#patientsList');

    $('#physicianName').text(`${physicianName}'s Patients: `);
    console.log("patients: ", patients[0]);
    if (patients.length > 0) {
        const patientsHtml = patients.map(patientName => {
            // Hardcoded heart rate stats for each patient
            const weeklyData = {
                averageHeartRate: 75,
                minHeartRate: 60,
                maxHeartRate: 90
            };

            return `
                <li class="list-group-item">
                    <strong>${patientName}</strong><br>
                    <p>7-Day Average: ${weeklyData.averageHeartRate} bpm</p>
                    <p>Max Heart Rate: ${weeklyData.maxHeartRate} bpm</p>
                    <p>Min Heart Rate: ${weeklyData.minHeartRate} bpm</p>
                    <button class="btn btn-info view-more-info" data-patient="${patientName}">View More Information</button>
                </li>`;
        }).join('');

        patientsList.html(`<ul class="list-group">${patientsHtml}</ul>`);
        // Add event listener for the "View More Information" button
        $('.view-more-info').click(function() {
            const patientName = $(this).data('patient');
            // Redirect to the viewPatientInfo.html page with the patient's name as a query parameter
            window.location.href = `viewPatientInfo.html?patient=${encodeURIComponent(patientName)}`;
        });
    } else {
        patientsList.html('<p>No patients assigned.</p>');
    }
}



