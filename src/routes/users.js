var express = require('express');
var router = express.Router();
var User = require("../models/users");
const jwt = require("jwt-simple");
const bcrypt = require("bcryptjs");
const fs = require('fs');

// On AWS ec2, you can use to store the secret in a separate file. 
// The file should be stored outside of your code directory. 
// For encoding/decoding JWT

const secret = fs.readFileSync(__dirname + '/../keys/jwtkey').toString();

// Signup route
router.post("/signUp", function (req, res) {
    console.log(req.body);  // Log to check incoming request body

    const { email, password, role, devices, name, physicians } = req.body;
    if (!role) {
        return res.status(400).json({ success: false, msg: "Role is required (Physician or Patient)." });
    }

    if ((!Array.isArray(devices) || devices.length === 0) && (role=='Patient')) {
        return res.status(400).json({ success: false, msg: "Devices are required and should be an array." });
    }

    User.findOne({ email: email }, function (err, user) {
        if (err) {
            res.status(500).json({ success: false, err: err });
        } else if (user) {
            res.status(401).json({ success: false, msg: "This email is already used." });
        } else {
            const passwordHash = bcrypt.hashSync(password, 10);
            if(role == 'Patient'){
                newUser = new User({
                    email: email,
                    passwordHash: passwordHash,
                    role: role,
                    devices: devices, // Save devices as an array
                    physicians: physicians,
                    name: name,
                    measurements: {
                        startTime: "06:00",
                        endTime: "22:00",
                        frequency: 30
                    }   
                });
            }
            else{
                newUser = new User({
                    email: email,
                    passwordHash: passwordHash,
                    role: role,
                    name: name,   
                });
            }

            newUser.save(function (err, user) {
                if (err) {
                    res.status(400).json({ success: false, err: err });
                } else {
                    const msgStr = `User (${email}) account has been created.`;
                    res.status(201).json({ success: true, message: msgStr });
                    console.log(msgStr);
                }
            });
        }
    });
});

router.post("/logIn", function (req, res) {
   if (!req.body.email || !req.body.password) {
       res.status(401).json({ error: "Missing email and/or password" });
       return;
   }
   // Get user from the database
   User.findOne({ email: req.body.email }, function (err, user) {
       if (err) {
           res.status(400).send(err);
       }
       else if (!user) {
           // Username not in the database
           res.status(401).json({ error: "Login failure!!" });
       }
       else {
           if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
               const token = jwt.encode({ email: user.email }, secret);
               //update user's last access time
               user.lastAccess = new Date();
               user.save((err, user) => {
                   console.log("User's LastAccess has been update.");
               });
               // Send back the token and role
               res.status(201).json({
                success: true,
                token: token,
                role: user.role, // Include the role
                msg: "Login success"
            });
           }
           else {
               res.status(401).json({ success: false, msg: "Email or password invalid." });
           }
       }
   });
});

router.get("/status", function (req, res) {
    // See if the X-Auth header is set
    if (!req.headers["x-auth"]) {
        return res.status(401).json({ success: false, msg: "Missing X-Auth header" });
    }
    // X-Auth should contain the token 
    const token = req.headers["x-auth"];
    try {
        const decoded = jwt.decode(token, secret);
        // Find the user by email and include role, email, and lastAccess
        User.findOne({ email: decoded.email }, "email role name patients measurements lastAccess", function (err, user) {
            if (err) {
                res.status(400).json({ success: false, message: "Error contacting DB. Please contact support." });
            } else if (user) {
                res.status(200).json(user); // Return user data including role
            } else {
                res.status(404).json({ success: false, message: "User not found" });
            }
        });
    } catch (ex) {
        res.status(401).json({ success: false, message: "Invalid JWT" });
    }
 });
// New router to get patient information by patient name
router.get("/patient", function (req, res) {
    // Check if the X-Auth header is present
    if (!req.headers["x-auth"]) {
        return res.status(401).json({ success: false, msg: "Missing X-Auth header" });
    }

    // X-Auth should contain the token 
    const token = req.headers["x-auth"];
    
    try {
        const decoded = jwt.decode(token, secret);
        const patientName = req.query.patient;  // Get the patient name from the query parameter
        console.log("patientName: ", patientName);
        
        if (!patientName) {
            return res.status(400).json({ success: false, msg: "Missing patient name in query parameter" });
        }
        
        // Find the customer by email and directly search for the patient by name
        User.findOne({ "name": patientName }, "email role name patients measurements lastAccess", function (err, user) {
            if (err) {
                return res.status(400).json({ success: false, message: "Error contacting DB. Please contact support." });
            } else if (user) {
                // Since patients is now just an array of names, you can return the data directly.
                console.log("user found: ", user);
                const patientData = user.patients.includes(patientName) ? patientName : null;
                res.status(200).json({ email: user.email, measurements: user.measurements, name: user.name });
               
            } else {
                res.status(404).json({ success: false, message: "User not found" });
            }
        });
    } catch (ex) {
        res.status(401).json({ success: false, message: "Invalid JWT" });
    }
});
// Update user's password
router.put("/updatePassword", function (req, res) {
    const { email, currentPassword, newPassword } = req.body;
    console.log("Request Data:", req.body);

    if (!email ||  !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, msg: "Missing email, current password, or new password." });
    }

    User.findOne({ email: email }, function (err, user) {
        if (err) {
            return res.status(500).json({ success: false, msg: "Database error." });
        }

        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found." });
        }

        if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
            return res.status(401).json({ success: false, msg: "Current password is incorrect." });
        }

        // Update password hash
        user.passwordHash = bcrypt.hashSync(newPassword, 10);
        user.save(function (err) {
            if (err) {
                return res.status(500).json({ success: false, msg: "Error saving new password." });
            }

            res.status(200).json({ success: true, msg: "Password updated successfully." });
        });
    });
});
// Validate user's current password
router.post("/validatePassword", function (req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, msg: "Missing email or password." });
    }
    User.findOne({ email: email }, function (err, user) {
        if (err) {
            return res.status(500).json({ success: false, msg: "Database error." });
        }

        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found." });
        }
        // Compare the provided password with the stored password hash
        if (!bcrypt.compareSync(password, user.passwordHash)) {
            return res.status(401).json({ success: false, valid: false, msg: "Password is incorrect." });
        }
        // Password is valid
        res.status(200).json({ success: true, valid: true, msg: "Password is valid." });
    });
});
// Update user's devices
router.put("/updateDevices", function (req, res) {
    const { email, devices } = req.body;

    if (!email || !Array.isArray(devices)) {
        return res.status(400).json({ success: false, msg: "Email and devices array are required." });
    }
    User.findOne({ email: email }, function (err, user) {
        if (err) {
            return res.status(500).json({ success: false, msg: "Database error." });
        }

        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found." });
        }
        // Update devices
        user.devices = devices;
        user.save(function (err) {
            if (err) {
                return res.status(500).json({ success: false, msg: "Error updating devices." });
            }
            res.status(200).json({ success: true, msg: "Devices updated successfully." });
        });
    });
});
// Get user's devices
router.get("/getDevices", function (req, res) {
    const email = req.query.email;

    if (!email) {
        return res.status(400).json({ success: false, msg: "Email is required." });
    }
    User.findOne({ email: email }, "devices", function (err, user) {
        if (err) {
            return res.status(500).json({ success: false, msg: "Database error." });
        }

        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found." });
        }
        res.status(200).json({ success: true, devices: user.devices });
    });
});
// Get user's email
router.get("/getUserEmail", function (req, res) {
    // Check if the X-Auth header is set
    if (!req.headers["x-auth"]) {
        return res.status(401).json({ success: false, msg: "Missing X-Auth header" });
    }
    // X-Auth should contain the JWT token
    const token = req.headers["x-auth"];
    try {
        const decoded = jwt.decode(token, secret); // Decode the JWT token

        // Send back the user's email
        res.status(200).json({ success: true, email: decoded.email });
    }
    catch (ex) {
        res.status(401).json({ success: false, message: "Invalid JWT" });
    }
});

// Endpoint to fetch physicians from the database
router.get("/getPhysicians", function (req, res) {
    // Check if the X-Auth header is set
    if (!req.headers["x-auth"]) {
        return res.status(401).json({ success: false, msg: "Missing X-Auth header" });
    }

    // X-Auth should contain the JWT token
    const token = req.headers["x-auth"];
    try {
        // Decode the JWT token without verifying
        const decoded = jwt.decode(token, secret);  // Decode the token

        // Log the decoded token for debugging
        console.log("Decoded token:", decoded);

        const userEmail = decoded.email;
        console.log("User Email:", userEmail);  // Should be printed

        // Fetch the user's role from the database using the decoded email
        User.findOne({ email: userEmail }, 'role', function (err, user) {
            if (err) {
                console.error("Database query error:", err.message);
                return res.status(500).json({ success: false, msg: "Database error" });
            }

            if (!user) {
                return res.status(404).json({ success: false, msg: "User not found" });
            }

            const userRole = user.role;
            console.log("User Role:", userRole);  // Should be printed

            // Role-based logic: only authenticated users with valid roles can fetch physicians
            if (userRole !== 'Patient' && userRole !== 'Physician') {
                return res.status(403).json({ success: false, msg: "Access denied" });
            }
            // Fetch physicians from the database
            User.find({ role: 'Physician' })
                .select('name email devices')  // Select only relevant fields
                .exec(function (err, physicians) {
                    if (err) {
                        console.error("Database query error:", err.message);
                        return res.status(500).json({ success: false, msg: "Database error" });
                    }

                    if (!physicians || physicians.length === 0) {
                        return res.status(404).json({ success: false, msg: "No physicians found" });
                    }

                    // Send physicians data in the response
                    res.status(200).json({ success: true, physicians });
                });
        });
    } catch (ex) {
        console.error("Error decoding JWT:", ex.message);
        res.status(401).json({ success: false, message: "Invalid JWT" });
    }
});
// Endpoint to assign a physician to a patient
router.put("/assignPhysician", function (req, res) {
    const { email, physicianName } = req.body; // Extracting patient email and physician name from request body

    // Validate input
    if (!email || !physicianName) {
        console.error("Missing email or physicianName. Request body:", req.body);
        return res.status(400).json({ success: false, msg: "Email and physician name are required." });
    }
    console.log(`Looking for patient with email: ${email}`);
    // Find the patient by email
    User.findOne({ email: email, role: 'Patient' }, function (err, patient) {
        if (err) {
            console.error("Database error while finding patient:", err.message);
            return res.status(500).json({ success: false, msg: "Database error" });
        }

        if (!patient) {
            console.log(`No patient found with email: ${email}`);
            return res.status(404).json({ success: false, msg: "Patient not found" });
        }
        console.log(`Patient found: ${patient.name} (Email: ${patient.email})`);

        // If the patient already has an assigned physician, find the current physician
        const currentPhysicianName = patient.physicians;
        // Find the new physician by name
        console.log(`Looking for new physician with name: ${physicianName}`);
        User.findOne({ name: physicianName, role: 'Physician' }, function (err, newPhysician) {
            if (err) {
                console.error("Database error while finding new physician:", err.message);
                return res.status(500).json({ success: false, msg: "Database error" });
            }

            if (!newPhysician) {
                console.log(`No physician found with name: ${physicianName}`);
                return res.status(404).json({ success: false, msg: "New physician not found" });
            }

            console.log(`New physician found: ${newPhysician.name} (Email: ${newPhysician.email})`);

            // Remove the patient from the current physician's patients array if applicable
            if (currentPhysicianName) {
                console.log(`Looking for current physician with name: ${currentPhysicianName}`);
                User.findOne({ name: currentPhysicianName, role: 'Physician' }, function (err, currentPhysician) {
                    if (err) {
                        console.error("Database error while finding current physician:", err.message);
                        return res.status(500).json({ success: false, msg: "Database error" });
                    }

                    if (currentPhysician) {
                        console.log(`Current physician found: ${currentPhysician.name} (Email: ${currentPhysician.email})`);
                        // Remove the patient from the current physician's patients array
                        currentPhysician.patients = currentPhysician.patients.filter(p => p !== patient.name);

                        console.log(`Removing patient ${patient.name} from current physician ${currentPhysician.name}`);

                        // Save the updated current physician record
                        currentPhysician.save(err => {
                            if (err) {
                                console.error("Error saving current physician record:", err.message);
                                return res.status(500).json({ success: false, msg: "Error saving current physician record" });
                            }
                        });
                    }
                });
            }

            // Assign the new physician to the patient
            patient.physicians = newPhysician.name;

            // Add the patient to the new physician's patients array (if not already present)
            if (!newPhysician.patients.includes(patient.name)) {
                newPhysician.patients.push(patient.name);
            }

            console.log(`Assigning new physician ${newPhysician.name} to patient ${patient.name}`);
            console.log(`Adding patient ${patient.name} to new physician ${newPhysician.name}`);

            // Save both updated records
            Promise.all([
                patient.save(),
                newPhysician.save()
            ])
                .then(() => {
                    console.log(`Successfully updated both patient and new physician records.`);
                    res.status(200).json({
                        success: true,
                        msg: `Patient ${patient.name} assigned to new physician ${newPhysician.name} successfully.`,
                    });
                })
                .catch(err => {
                    console.error("Error saving records:", err.message);
                    res.status(500).json({ success: false, msg: "Error saving records" });
                });
        });
    });
});

// Endpoint to fetch the assigned physician for a patient
router.get("/getAssignedPhysician", function (req, res) {
    const patientEmail = req.query.email; // Get email from the query parameter

    // Check if the email is provided
    if (!patientEmail) {
        return res.status(400).json({ success: false, msg: "Email is required" });
    }

    // Fetch the patient's assigned physician from the database using the email
    User.findOne({ email: patientEmail }, 'physicians', function (err, patient) {
        if (err) {
            console.error("Database query error:", err.message);
            return res.status(500).json({ success: false, msg: "Database error" });
        }

        if (!patient) {
            return res.status(404).json({ success: false, msg: "Patient not found" });
        }

        const assignedPhysician = patient.physicians; // Access the physicians field
        console.log("Assigned Physician:", assignedPhysician);  // Log the assigned physician

        if (!assignedPhysician) {
            return res.status(404).json({ success: false, msg: "No assigned physician found" });
        }

        // Send assigned physician data in the response
        res.status(200).json({ success: true, physician: assignedPhysician });
    });
});
router.post("/submitMeasurement", function (req, res) {
    const { timeRangeStart, timeRangeEnd, frequency, user } = req.body;  // Extract form data from the request body

    // Validate that all required fields are provided
    if (!timeRangeStart || !timeRangeEnd || !frequency) {
        return res.status(400).json({ success: false, msg: "All fields (timeRangeStart, timeRangeEnd, frequency) are required" });
    }
    // Log the user object to inspect its contents
    console.log("User object: ", user);

    if (!user) {
        return res.status(401).json({ success: false, msg: "Unauthorized" });
    }

    // Find the customer in the database by their unique identifier (e.g., email or ID)
    User.findOne({ email: user }, function (err, user) {
        if (err) {
            console.error("Database query error:", err.message);
            return res.status(500).json({ success: false, msg: "Database error" });
        }

        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found" });
        }

        // Update the customer's measurement preferences
        user.measurements = {
            startTime: timeRangeStart,
            endTime: timeRangeEnd,
            frequency: frequency
        };

        // Save the updated customer data
        user.save(function (saveErr) {
            if (saveErr) {
                console.error("Error saving data:", saveErr.message);
                return res.status(500).json({ success: false, msg: "Failed to save data" });
            }

            // Respond with success
            res.status(200).json({ success: true, msg: "Measurement data successfully updated" });
        });
    });
});
// Endpoint to fetch sensor readings for a user using x-auth token
router.get("/getSensorReadings", function (req, res) {
    // Check if the X-Auth header is set
    if (!req.headers["x-auth"]) {
        return res.status(401).json({ success: false, msg: "Missing X-Auth header" });
    }

    // X-Auth should contain the JWT token
    const token = req.headers["x-auth"];
    try {
        // Decode the JWT token without verifying (you can also verify it, but for this example, we only decode)
        const decoded = jwt.decode(token, secret); // Decode the token

        // Log the decoded token for debugging
        console.log("Decoded token:", decoded);

        const userEmail = decoded.email; // Get the email from the decoded token
        console.log("User Email:", userEmail);  // Should be printed

        // Fetch the user from the database using the decoded email
        User.findOne({ email: userEmail }, 'sensorReadings', function (err, user) {
            if (err) {
                console.error("Database query error:", err.message);
                return res.status(500).json({ success: false, msg: "Database error" });
            }

            if (!user) {
                return res.status(404).json({ success: false, msg: "User not found" });
            }

            const sensorReadings = user.sensorReadings; // Get the sensor readings from the user document
            console.log("Sensor Readings:", sensorReadings);  // Log the sensor readings

            if (!sensorReadings || sensorReadings.length === 0) {
                return res.status(404).json({ success: false, msg: "No sensor readings found" });
            }

            // Send sensor readings data in the response
            res.status(200).json({ success: true, sensorReadings });
        });
    } catch (ex) {
        console.error("Error decoding JWT:", ex.message);
        return res.status(401).json({ success: false, message: "Invalid JWT" });
    }
});

module.exports = router;