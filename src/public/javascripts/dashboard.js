// Check if the token exists before proceeding
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

// Fetch the logged-in user's email and role using the API
fetch('/users/status', {
  method: 'GET',
  headers: {
    'x-auth': token // Retrieve the token from localStorage
  },
  dataType: 'json'
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    const userRole = data.role; // Getting the role from the response

    // Display the email in the top right corner
    document.getElementById('userName').textContent = `Logged In as: ${data.name}`;

    // Set the correct links based on the role
    if (userRole === 'Patient') {
      document.getElementById('homeLink').href = 'patientAccount.html'; // Patient home page
      document.getElementById('editProfileLink').href = 'editPatient.html'; // Edit patient profile
    } else if (userRole === 'Physician') {
      document.getElementById('homeLink').href = 'physicianAccount.html'; // Physician home page
      document.getElementById('editProfileLink').href = 'editPhysician.html'; // Edit physician profile
    } else {
      console.error('Unknown user role:', userRole); // Log an error for unknown roles
      // Optional: Redirect to an error page or display a message
    }
  })
  .catch(error => {
    console.error('Error fetching user data:', error); // Catch any errors in the API call
    // Optional: Redirect to login page or show an error message
  });

// Event listener for the Log Out link
document.getElementById('logoutLink').addEventListener('click', function () {
  // Remove the token from localStorage when the user clicks Log Out
  localStorage.removeItem('token');

  // Redirect the user to the login page
  window.location.href = 'index.html';
});
