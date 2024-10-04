document.addEventListener('DOMContentLoaded', function() {
    // Dropdown menu functionality
    const dropdownButtons = document.querySelectorAll('.navbar-dropdown button');
    dropdownButtons.forEach(button => {
        button.addEventListener('click', function() {
            const dropdownContent = this.nextElementSibling;
            // Toggle dropdown visibility
            if (dropdownContent.style.display === 'block') {
                dropdownContent.style.display = 'none';
            } else {
                document.querySelectorAll('.navbar-dropdown-content').forEach(content => {
                    content.style.display = 'none'; // Hide all dropdowns
                });
                dropdownContent.style.display = 'block'; // Show current dropdown
            }
        });
    });

    // Registration form submission
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', function() {
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const year = document.getElementById('year').value.trim();
            const occupation = document.getElementById('occupation').value.trim();
            const password = document.getElementById('password').value.trim(); // New password field

            // Basic validation
            if (!name || !email || !year || !occupation || !password) { // Include password in validation
                alert('Please fill out all fields.');
                return;
            }

            const userData = { name, email, graduation_year: year, occupation, password }; // Include password in user data

            // Send user data to server for registration
            fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            })
            .then(response => {
                console.log('Response Status:', response.status); // Log status for debugging
                return response.json();
            })
            .then(data => {
                console.log('Registration Response:', data);
                alert(data.message);

                // Save email in local storage and redirect to OTP confirmation page
                if (data.message.includes('OTP sent')) {
                    localStorage.setItem('userEmail', email);
                    window.location.href = 'confirm-otp.html';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred during registration. Please try again.');
            });
        });
    }

    // OTP Verification Logic
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', function() {
            const otp = document.getElementById('otp').value.trim();
            const email = localStorage.getItem('userEmail');

            if (!otp) {
                alert('Please enter the OTP.');
                return;
            }

            const otpData = { email, otp };

            fetch('http://localhost:5000/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(otpData)
            })
            .then(response => {
                console.log('Response Status:', response.status); // Log status for debugging
                return response.json();
            })
            .then(data => {
                console.log('OTP Verification Response:', data);
                alert(data.message);

                // If OTP verification is successful, redirect to login page
                if (data.message === 'OTP verified successfully, user registered.') {
                    localStorage.removeItem('userEmail');
                    window.location.href = 'login.html';
                } else {
                    alert('Failed to verify OTP. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred during OTP verification. Please try again.');
            });
        });
    }

    // Login Logic
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Get the email and password values from the form
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Create an object with the login data
        const loginData = {
            email: email,
            password: password
        };

        try {
            // Make a POST request to the login endpoint
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            // Check the response status
            if (response.ok) {
                // If the login is successful, redirect to the dashboard
                window.location.href = 'dashboard.html'; // Change this to your dashboard URL
            } else {
                // If the login fails, get the error message and display it
                const errorData = await response.json();
                document.getElementById('loginMessage').innerText = errorData.message || 'Login failed. Please try again.';
            }
        } catch (error) {
            console.error('Error during login:', error);
            document.getElementById('loginMessage').innerText = 'An error occurred. Please try again later.';
        }
    });
}

    // Event registration form submission
    const registerEventBtn = document.getElementById('registerEventBtn');
    if (registerEventBtn) {
        registerEventBtn.addEventListener('click', function() {
            const participantName = document.getElementById('name').value.trim(); // Ensure IDs match your HTML
            const participantEmail = document.getElementById('email').value.trim(); // Ensure IDs match your HTML
            const eventName = document.getElementById('event').value; // Ensure this ID matches the select element

            // Basic validation
            if (!participantName || !participantEmail || !eventName) {
                alert('Please fill out all fields.');
                return;
            }

            const eventData = {
                participantName,
                participantEmail,
                eventName
            };

            // Send event registration data to the server
            fetch('http://localhost:5000/register-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            })
            .then(response => {
                console.log('Response Status:', response.status); // Log status for debugging
                return response.json();
            })
            .then(data => {
                console.log('Event Registration Response:', data);
                alert(data.message); // Use the message from the server response

                // Redirect on successful registration
                if (data.message === 'Successfully registered for the event.') {
                    window.location.href = 'success.html'; // Redirect to success page
                } else {
                    alert('Failed to register for the event. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred during event registration. Please try again.');
            });
        });
    }
});
