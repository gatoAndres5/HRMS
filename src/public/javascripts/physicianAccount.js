// Helper function to calculate the average of an array of numbers
function calculateAverage(data) {
    const sum = data.reduce((total, value) => total + value, 0);
    return Math.round(sum / data.length) || 0; // Round to nearest integer
}

// Helper function to fetch patient sensor readings and calculate weekly stats
function fetchPatientInfo(patientName, callback) {
    $.ajax({
        url: '/users/getSensorReadings?patient=' + encodeURIComponent(patientName),
        method: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("token") },
        dataType: 'json'
    })
    .done(function (data) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const filteredReadings = data.sensorReadings.filter(reading => {
            const readingDate = new Date(reading.heartRate.date);
            return readingDate >= oneWeekAgo;
        });

        const heartRates = filteredReadings.map(reading => reading.heartRate.bpm);
        const averageHeartRate = calculateAverage(heartRates);
        const minHeartRate = Math.round(Math.min(...heartRates)) || 0;
        const maxHeartRate = Math.round(Math.max(...heartRates)) || 0;

        const weeklyStats = {
            averageHeartRate: averageHeartRate || "N/A",
            minHeartRate: minHeartRate || "N/A",
            maxHeartRate: maxHeartRate || "N/A"
        };

        callback(null, { patientName, weeklyStats });
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        console.error('Error fetching sensor readings:', textStatus, errorThrown);
        callback(errorThrown, null);
    });
}

// Function to display the physician's patients and their stats
function displayPhysicianPatients(data) {
    const physicianName = data.name || "Unknown";
    const patients = data.patients || [];
    const patientsList = $('#patientsList');

    $('#physicianName').text(`${physicianName}'s Patients: `);

    if (patients.length > 0) {
        let patientsHtml = '';
        let completedRequests = 0;

        patients.forEach(patientName => {
            fetchPatientInfo(patientName, (err, result) => {
                completedRequests++;

                if (err) {
                    patientsHtml += `
                        <li class="list-group-item">
                            <strong>${patientName}</strong><br>
                            <p>Error fetching data.</p>
                        </li>`;
                } else {
                    const { weeklyStats } = result;
                    patientsHtml += `
                        <li class="list-group-item">
                            <strong>${result.patientName}</strong><br>
                            <p>7-Day Average: ${weeklyStats.averageHeartRate} bpm</p>
                            <p>Max Heart Rate: ${weeklyStats.maxHeartRate} bpm</p>
                            <p>Min Heart Rate: ${weeklyStats.minHeartRate} bpm</p>
                            <button class="btn btn-info view-more-info" data-patient="${result.patientName}">View More Information</button>
                        </li>`;
                }

                if (completedRequests === patients.length) {
                    patientsList.html(`<ul class="list-group">${patientsHtml}</ul>`);

                    // Add event listener for the "View More Information" button
                    $('.view-more-info').click(function () {
                        const patientName = $(this).data('patient');
                        window.location.href = `viewPatientInfo.html?patient=${encodeURIComponent(patientName)}`;
                    });
                }
            });
        });
    } else {
        patientsList.html('<p>No patients assigned.</p>');
    }
}

$(function () {
    // Fetch the logged-in user's details
    $.ajax({
        url: '/users/status', // Endpoint to fetch physician details
        method: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("token") },
        dataType: 'json'
    })
    .done(function (data) {
        displayPhysicianPatients(data);
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        console.error("Failed to fetch physician details:", errorThrown);
        window.location.replace("display.html");
    });
});
