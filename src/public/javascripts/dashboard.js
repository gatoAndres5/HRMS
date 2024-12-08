console.log('Dashboard script is loaded');

// Fetch the logged-in user's email and role using the API
fetch('/customers/status', {
  method: 'GET',
  headers: {
    'x-auth': localStorage.getItem('token') // Retrieve the token from localStorage
  },
  dataType: 'json'
})
.then(response => response.json())
.then(data => {
  console.log('User data:', data);
  const userEmail = data.email; // Getting the email from the response
  const userRole = data.role; // Getting the role from the response

  // Display the email in the top right corner
  document.getElementById('userEmail').textContent = userEmail;

  // Set the correct links based on the role
  if (userRole === 'Patient') {
    document.getElementById('homeLink').href = 'account.html'; // Patient home page
    document.getElementById('editProfileLink').href = 'editPatient.html'; // Edit patient profile
  } else if (userRole === 'Physician') {
    document.getElementById('homeLink').href = 'physicianAccount.html'; // Physician home page
    document.getElementById('editProfileLink').href = 'editPhysician.html'; // Edit physician profile
  } else {
    console.error('Unknown user role:', userRole); // Log an error for unknown roles
  }
})
.catch(error => {
  console.error('Error fetching user data:', error); // Catch any errors in the API call
});

// Event listener for handling link clicks (event delegation)
document.addEventListener('click', function(event) {
  if (event.target && event.target.id === 'homeLink') {
    console.log('Home link clicked');
    // You can add any additional logic here, like page tracking or analytics
  }
  if (event.target && event.target.id === 'editProfileLink') {
    console.log('Edit Profile link clicked');
    // Similarly, handle Edit Profile link click here
  }
});
