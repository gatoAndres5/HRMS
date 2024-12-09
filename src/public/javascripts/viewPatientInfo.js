let userEmail = null;

// Function to convert 24-hour time to 12-hour format with AM/PM
function convertTo12HourFormat(time24) {
    const [hour, minute] = time24.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12; // Convert 0 to 12 for midnight
    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
}

// Function to fetch updated data and refresh the UI based on patient name
function refreshMeasurementData(patientName) {
    $.ajax({
        url: '/customers/patient?patient=' + encodeURIComponent(patientName), // Include the patient query parameter in the URL
        method: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("token") },
        dataType: 'json'
    })
    .done(function (data) {
        // Update the UI with the refreshed data
        console.log('Refreshed data:', data);
        userEmail = data.email;
        //document.getElementById('dashboardTitle').textContent = `${data.name}'s Patient Dashboard`;
        document.getElementById('patientTitle').textContent = `${data.name}'s Patient Dashboard`;
        document.getElementById("currentStartTime").textContent = convertTo12HourFormat(data.measurements.startTime);
        document.getElementById("currentEndTime").textContent = convertTo12HourFormat(data.measurements.endTime);
        document.getElementById("currentFrequency").textContent = data.measurements.frequency;
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        console.error('Error fetching updated data:', textStatus, errorThrown);
        alert('Could not refresh data. Please try again later.');
    });
}

$(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const patientName = urlParams.get('patient');  // Get 'patient' query parameter
    console.log("Patient Name from query:", patientName);

    // Fetch and display the user data based on patient name
    refreshMeasurementData(patientName);

    $('#measurementForm').submit(function (event) {
        event.preventDefault(); // Prevent default form submission

        // Collect form data from input fields
        let txdata = {
            timeRangeStart: $('#timeRangeStart').val(), // Get value from start time input
            timeRangeEnd: $('#timeRangeEnd').val(),     // Get value from end time input
            frequency: $('#frequency').val(),           // Get value from frequency input
            user: userEmail
        };

        // Send the data to the backend
        $.ajax({
            url: '/customers/submitMeasurement', // Backend route
            method: 'POST',
            contentType: 'application/json',
            headers: { 'x-auth': window.localStorage.getItem("token") }, // Send the token for authentication
            data: JSON.stringify(txdata), // Send the form data as JSON
            dataType: 'json'
        })
        .done(function (response) {
            // Handle the success response
            console.log('Data updated:', response);
            // Fetch the updated data and refresh the UI
            refreshMeasurementData(patientName);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            // Handle failure
            console.error('Error:', errorThrown);
            alert('An error occurred, please try again.');
        });
    });

    // Populate Weekly Summary Data (mock data for now)
    const weeklyData = {
        averageHeartRate: 75,
        minHeartRate: 60,
        maxHeartRate: 90
    };
    console.log("Weekly Data:", weeklyData);  // Debugging: Check weekly data
    $("#avgHeartRate").text(weeklyData.averageHeartRate);
    $("#minHeartRate").text(weeklyData.minHeartRate);
    $("#maxHeartRate").text(weeklyData.maxHeartRate);

    // Data for Detailed Daily View (mock data for now)
    const dailyData = {
        "2024-12-01": {
            heartRate: [65, 70, 72, 68, 75, 80, 85],
            oxygenSaturation: [98, 97, 96, 97, 98, 99, 97],
            times: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]
        },
        "2024-12-02": {
            heartRate: [62, 66, 68, 65, 72, 77, 83],
            oxygenSaturation: [97, 96, 96, 98, 99, 98, 96],
            times: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]
        },
        "2024-12-03": {
            heartRate: [62, 66, 68, 65, 72, 70, 102],
            oxygenSaturation: [97, 96, 96, 98, 99, 98, 96],
            times: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]
        },
        "2024-12-04": {
            heartRate: [62, 66, 68, 65, 72, 77, 83],
            oxygenSaturation: [97, 96, 96, 98, 99, 98, 96],
            times: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]
        }
    };
    console.log("Daily Data:", dailyData);  // Debugging: Check daily data

    // Handle Day Selection for Detailed Daily View
    $("#daySelector").change(function () {
        const selectedDay = $(this).val();
        console.log("Day selected:", selectedDay);  // Debugging: Log the selected day
        const data = dailyData[selectedDay];

        if (data) {
            // Debugging: Log the data for the selected day
            console.log("Selected day data:", data);
            // Update charts with the selected day's data
            updateChart("heartRateChart", "Heart Rate (bpm)", data.heartRate, data.times, "rgba(255, 99, 132, 1)", "rgba(255, 99, 132, 0.2)");
            updateChart("oxygenChart", "Oxygen Saturation (%)", data.oxygenSaturation, data.times, "rgba(54, 162, 235, 1)", "rgba(54, 162, 235, 0.2)");
        } else {
            // Debugging: Log when no data is found for the selected day
            console.warn("No data found for the selected day:", selectedDay);
        }
    });
    let heartRateChartInstance = null;
let oxygenChartInstance = null;

function updateChart(canvasId, label, data, labels, borderColor, backgroundColor) {
    console.log(`Updating chart: ${canvasId}, Label: ${label}`);
  
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
  
    // Clear the canvas completely before using it
    console.log(`Clearing canvas with ID: ${canvasId}`);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Destroy existing chart instance if it exists
    if (canvasId === "heartRateChart") {
        if (heartRateChartInstance) {
            console.log(`Destroying existing chart with ID: heartRateChart`);
            heartRateChartInstance.destroy();
            heartRateChartInstance = null;
        }
    } else if (canvasId === "oxygenChart") {
        if (oxygenChartInstance) {
            console.log(`Destroying existing chart with ID: oxygenChart`);
            oxygenChartInstance.destroy();
            oxygenChartInstance = null;
        }
    }
  
    // Re-initialize the canvas
    canvas.width = canvas.width;  // Reset canvas width (also clears any chart references)
    canvas.height = canvas.height; // Reset canvas height
  
    // Calculate min and max values for annotation
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
  
    try {
        console.log(`Creating new chart with ID: ${canvasId}`);
        const newChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: label,
                        data: data,
                        borderColor: borderColor,
                        backgroundColor: backgroundColor,
                        fill: true,
                        pointBackgroundColor: backgroundColor // Default color for points
                    },
                    {
                        label: 'Min Value', // Custom label for min value
                        data: [minValue], // Only include min value
                        pointBackgroundColor: 'red', // Color for min point
                        pointRadius: 5, // Size of min point
                        fill: false, // No fill for this dataset
                        borderColor: 'red',
                        borderWidth: 0, // No border
                        showLine: false, // No line connecting points
                        pointStyle: 'circle'
                    },
                    {
                        label: 'Max Value', // Custom label for max value
                        data: [maxValue], // Only include max value
                        pointBackgroundColor: 'green', // Color for max point
                        pointRadius: 5, // Size of max point
                        fill: false, // No fill for this dataset
                        borderColor: 'green',
                        borderWidth: 0, // No border
                        showLine: false, // No line connecting points
                        pointStyle: 'circle'
                    }
                ]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: "Time of Day" } },
                    y: { title: { display: true, text: label } }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top', // Set position of legend
                        labels: {
                            filter: function(legendItem, chartData) {
                                // Display the dots in the legend for min and max value
                                if (legendItem.datasetIndex === 0) {
                                    return true; // Display the main data line
                                }
                                // Display only the red and green dots for min/max values in the legend
                                if (legendItem.datasetIndex === 1 || legendItem.datasetIndex === 2) {
                                    legendItem.pointStyle = 'circle'; // Set point style for dots
                                    return true;
                                }
                                return false;
                            },
                            generateLabels: function(chart) {
                                const originalLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                // Customize labels for min and max with colored dots
                                originalLabels.forEach(label => {
                                    if (label.text === 'Min Value') {
                                        label.pointStyle = 'circle';
                                        label.fillStyle = 'red'; // Red dot for Min Value
                                    } else if (label.text === 'Max Value') {
                                        label.pointStyle = 'circle';
                                        label.fillStyle = 'green'; // Green dot for Max Value
                                    }
                                });
                                return originalLabels;
                            }
                        }
                    }
                }
            }
        });
      
        // Assign the new chart instance to the appropriate variable
        if (canvasId === "heartRateChart") {
            heartRateChartInstance = newChart;
            console.log(`Assigned new chart instance to heartRateChart`);
        } else if (canvasId === "oxygenChart") {
            oxygenChartInstance = newChart;
            console.log(`Assigned new chart instance to oxygenChart`);
        }
    } catch (error) {
        console.error("Error creating the chart:", error);
    }
}
});
