const express = require('express'); // Import Express framework
const bodyParser = require('body-parser'); // Middleware for parsing request bodies
const nodemailer = require('nodemailer'); // Import Nodemailer for sending emails
const crypto = require('crypto'); // For generating random OTPs
const mysql = require('mysql'); // MySQL database connection
const cors = require('cors'); // Middleware for handling CORS
const http = require('http'); // HTTP server
const socketIo = require('socket.io'); // For WebSocket functionality

const app = express(); // Create an Express app
const server = http.createServer(app); // Create an HTTP server using the app
const io = socketIo(server); // Attach Socket.IO to the server

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password', // Ensure this is set correctly
    database: 'alumni_db' // Confirm database name
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use Gmail service
    auth: {
        user: 'networkalumini@gmail.com', // Ensure this is the correct email
        pass: 'sbqp pyil nwzm rxtd' // Make sure you use an app password
    }
});

// Registration route
app.post('/register', (req, res) => {
    const { name, email, graduation_year, occupation, password } = req.body;

    // Validate required fields
    if (!name || !email || !graduation_year || !occupation || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Generate OTP and expiry
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate a random OTP
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // Set OTP expiry to 10 minutes from now

    // SQL query to insert user into the database
    const sql = 'INSERT INTO users (name, email, graduation_year, occupation, password, otp, otp_expiry, otp_verified) VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)';
    db.query(sql, [name, email, graduation_year, occupation, password, otp, otpExpiry], (err, result) => {
        if (err) {
            console.error('Error inserting user into database:', err); // Log error
            return res.status(500).json({ message: 'Error registering user.' });
        }

        // Prepare email options
        const mailOptions = {
            from: 'networkalumini@gmail.com',
            to: email,
            subject: 'Your OTP for Alumni Registration',
            text: `Hello ${name}, your OTP is ${otp}. It will expire in 10 minutes.`
        };

        // Send the OTP email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending OTP:', error); // Log email error
                return res.status(500).json({ message: 'Error sending OTP.' });
            }
            console.log('OTP sent: ' + info.response); // Log success message
            res.json({ message: 'OTP sent to your email.' });
        });
    });
});

// OTP verification route
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    // Validate required fields
    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    // SQL query to select user based on email and OTP
    const sql = 'SELECT * FROM users WHERE email = ? AND otp = ?';
    db.query(sql, [email, otp], (err, results) => {
        if (err) {
            console.error('Error verifying OTP:', err); // Log error
            return res.status(500).json({ message: 'Error verifying OTP.' });
        }
        if (results.length > 0) {
            // Check if OTP is still valid
            const user = results[0];
            const currentTime = new Date();

            // Check if OTP has expired
            if (currentTime > user.otp_expiry) {
                return res.status(400).json({ message: 'OTP has expired.' });
            }

            // SQL query to update user verification status
            const updateSql = 'UPDATE users SET otp_verified = TRUE WHERE email = ?';
            db.query(updateSql, [email], (err, result) => {
                if (err) {
                    console.error('Error updating user:', err); // Log update error
                    return res.status(500).json({ message: 'Error updating user.' });
                }
                res.json({ message: 'OTP verified successfully, user registered.' }); // Success response
            });
        } else {
            res.status(400).json({ message: 'Invalid OTP.' }); // Invalid OTP response
        }
    });
});
// ... [existing code above remains unchanged]

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    // SQL query to find user by email
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ message: 'Error logging in.' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const user = results[0];

        // Compare stored password with the provided password
        if (user.password !== password) { // Ensure you use the same logic for password checking
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // Login successful
        res.json({ message: 'Login successful!' });
    });
});


// Networking page route - fetch users who have verified their OTP
app.get('/networking', (req, res) => {
    const sql = 'SELECT name, email, graduation_year, occupation FROM users WHERE otp_verified = TRUE';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err); // Log fetch error
            return res.status(500).json({ message: 'Error fetching users.' });
        }
        res.json(results); // Return users data
    });
});

// Donation route
app.post('/donate', (req, res) => {
    const { donationAmount, donorName, donorEmail } = req.body;

    // Validate required fields
    if (!donationAmount || !donorName || !donorEmail) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // SQL query to insert donation into the database
    const sql = 'INSERT INTO donations (donorName, donorEmail, donationAmount) VALUES (?, ?, ?)';
    db.query(sql, [donorName, donorEmail, donationAmount], (err, result) => {
        if (err) {
            console.error('Error processing donation:', err); // Log donation error
            return res.status(500).json({ message: 'Error processing donation.' });
        }
        res.json({ message: 'Thank you for your donation!' }); // Success response
    });
});

// Event registration route
app.post('/register-event', (req, res) => {
    const { eventName, participantName, participantEmail } = req.body;

    // Validate required fields
    if (!eventName || !participantName || !participantEmail) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // SQL query to insert event registration into the database
    const sql = 'INSERT INTO event_registrations (event_name, participant_name, participant_email) VALUES (?, ?, ?)';
    db.query(sql, [eventName, participantName, participantEmail], (err, result) => {
        if (err) {
            console.error('Error registering for event:', err); // Log registration error
            return res.status(500).json({ message: 'Error registering for event.' });
        }

        res.json({ message: 'Successfully registered for the event.' }); // Success response
    });
});

// WebSocket Chat Functionality
const userSockets = {}; // Track connected users and their sockets

io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle user identification
    socket.on('identify', (email) => {
        userSockets[email] = socket; // Associate the email with the socket
        console.log(`User identified: ${email}`);
    });

    // Handle incoming chat messages
    socket.on('chat message', (msg) => {
        const { recipient, text, sender } = msg;
        // Send message to the intended recipient
        if (userSockets[recipient]) {
            userSockets[recipient].emit('chat message', { sender, text });
        }
        // Optionally, broadcast to all users (if needed)
        io.emit('chat message', msg);
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        for (const email in userSockets) {
            if (userSockets[email] === socket) {
                delete userSockets[email]; // Remove user from the socket tracking
                break;
            }
        }
        console.log('User disconnected');
    });
});

// Start the server
server.listen(5000, () => {
    console.log('Server is running on port 5000'); // Confirm server startup
});
