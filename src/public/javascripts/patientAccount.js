let userEmail = null;
let heartRateChartInstance = null;
let oxygenChartInstance = null;
// Function to convert 24-hour time to 12-hour format with AM/PM
function convertTo12HourFormat(time24) {
    const [hour, minute] = time24.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12; // Convert 0 to 12 for midnight
    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
}
// Helper function to calculate the average of an array of numbers
function calculateAverage(data) {
    const sum = data.reduce((total, value) => total + value, 0);
    return Math.round(sum / data.length) || 0;  // Round to nearest integer
}
// Helper function to group sensor readings by date
function groupReadingsByDate(readings) {
    return readings.reduce((acc, entry) => {
        const date = new Date(entry.heartRate.date).toISOString().split('T')[0];  // Get the date part only (YYYY-MM-DD)

        if (!acc[date]) {
            acc[date] = [];
        }

        acc[date].push(entry);  // Add the entry to the corresponding date group

        return acc;
    }, {});
}

// Function to fetch updated data and refresh the UI
function refreshMeasurementData() {
    $.ajax({
        url: '/users/status', // Fetch the updated data
        method: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("token") },
        dataType: 'json'
    })
    .done(function (data) {
        // Update the UI with the refreshed data
        console.log('Refreshed data:', data);
        userEmail = data.email;
        document.getElementById("currentStartTime").textContent = convertTo12HourFormat(data.measurements.startTime);
        document.getElementById("currentEndTime").textContent = convertTo12HourFormat(data.measurements.endTime);
        document.getElementById("currentFrequency").textContent = data.measurements.frequency;
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        console.error('Error fetching updated data:', textStatus, errorThrown);
        alert('Could not refresh data. Please try again later.');
    });
}
// Function to fetch updated data and refresh the UI
function fetchSensorReadings() {
    $.ajax({
        url: '/users/getSensorReadings',
        method: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("token") },
        dataType: 'json'
    })
    .done(function (data) {
        console.log('Sensor Readings:', data);

        // Filter the data to include only the last week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const filteredReadings = data.sensorReadings.filter(reading => {
            const readingDate = new Date(reading.heartRate.date);
            return readingDate >= oneWeekAgo;
        });
        console.log("Filterd Readiings:", filteredReadings);

        // Calculate average, min, and max heart rate for the week
        const heartRates = filteredReadings.map(reading => reading.heartRate.bpm);
        const averageHeartRate = calculateAverage(heartRates);
        const minHeartRate = Math.round(Math.min(...heartRates)) || 0;
        const maxHeartRate = Math.round(Math.max(...heartRates)) || 0;
        // Update Weekly Summary Data
        const weeklySummary = {
            averageHeartRate: averageHeartRate,
            minHeartRate: minHeartRate,
            maxHeartRate: maxHeartRate
        };
        $("#avgHeartRate").text(weeklySummary.averageHeartRate);
        $("#minHeartRate").text(weeklySummary.minHeartRate);
        $("#maxHeartRate").text(weeklySummary.maxHeartRate);

        
        const groupedByDate = groupReadingsByDate(data.sensorReadings);

        // Update Day Selector options
        const daySelector = $("#daySelector");
        daySelector.empty();

        // Populate day selector with the available dates
        Object.keys(groupedByDate).forEach(day => {
            daySelector.append(new Option(day, day));
        });

        // Handle Day Selection for Detailed Daily View
        daySelector.change(function () {
            const selectedDay = $(this).val();
            const selectedData = groupedByDate[selectedDay];

            if (selectedData) {
                console.log("Selected day data:", selectedData);
                // Extract times, heart rate, and oxygen saturation from the selected data
                const heartRates = selectedData.map(entry => entry.heartRate.bpm);
                const oxygenSaturation = selectedData.map(entry => entry.oxygenSaturation.o2);
                const times = selectedData.map(entry => {
                    const date = new Date(entry.heartRate.date);
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                });

                // Update charts
                updateChart("heartRateChart", "Heart Rate (bpm)", heartRates, times, "rgba(255, 99, 132, 1)", "rgba(255, 99, 132, 0.2)");
                updateChart("oxygenChart", "Oxygen Saturation (%)", oxygenSaturation, times, "rgba(54, 162, 235, 1)", "rgba(54, 162, 235, 0.2)");
            } else {
                console.warn("No data found for the selected day:", selectedDay);
            }
        });

        // Trigger change for the default day if available
        if (Object.keys(groupedByDate).length > 0) {
            daySelector.trigger("change");
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        console.error('Error fetching sensor readings:', textStatus, errorThrown);
        alert('No sensor readings available. Please try again later.');
    });
}
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
                    x: { title: { display: true, text: "Time of Day (MST)" } },
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

$(function () {
    refreshMeasurementData();
    fetchSensorReadings();
    $('#measurementForm').submit(function (event) {
        event.preventDefault(); // Prevent default form submission

        // Collect form data from input fields
        let txdata = {
            timeRangeStart: $('#timeRangeStart').val(), // Get value from start time input
            timeRangeEnd: $('#timeRangeEnd').val(),     // Get value from end time input
            frequency: $('#frequency').val(),          // Get value from frequency input
            user: userEmail
        };

        // Send the data to the backend
        $.ajax({
            url: '/users/submitMeasurement', // Backend route
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
            refreshMeasurementData();
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            // Handle failure
            console.error('Error:', errorThrown);
            alert('An error occurred, please try again.');
        });
    });

});


