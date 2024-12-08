var express = require('express');
var router = express.Router();
var Customer = require("../models/customer");
const jwt = require("jwt-simple");
const bcrypt = require("bcryptjs");
const fs = require('fs');

// On AWS ec2, you can use to store the secret in a separate file. 
// The file should be stored outside of your code directory. 
// For encoding/decoding JWT

const secret = fs.readFileSync(__dirname + '/../keys/jwtkey').toString();


// please fiil in the blanks
// see javascript/signup.js for ajax call
// see Figure 9.3.5: Node.js project uses token-based authentication and password hashing with bcryptjs on zybooks

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

    Customer.findOne({ email: email }, function (err, customer) {
        if (err) {
            res.status(500).json({ success: false, err: err });
        } else if (customer) {
            res.status(401).json({ success: false, msg: "This email is already used." });
        } else {
            const passwordHash = bcrypt.hashSync(password, 10);
            if(role == 'Patient'){
                newCustomer = new Customer({
                    email: email,
                    passwordHash: passwordHash,
                    role: role,
                    devices: devices, // Save devices as an array
                    physicians: physicians   
                });
            }
            else{
                newCustomer = new Customer({
                    email: email,
                    passwordHash: passwordHash,
                    role: role,
                    devices: devices, // Save devices as an array
                    name: name,   
                });
            }

            newCustomer.save(function (err, customer) {
                if (err) {
                    res.status(400).json({ success: false, err: err });
                } else {
                    const msgStr = `Customer (${email}) account has been created.`;
                    res.status(201).json({ success: true, message: msgStr });
                    console.log(msgStr);
                }
            });
        }
    });
});




// please fill in the blanks
// see javascript/login.js for ajax call
// see Figure 9.3.5: Node.js project uses token-based authentication and password hashing with bcryptjs on zybooks

router.post("/logIn", function (req, res) {
   if (!req.body.email || !req.body.password) {
       res.status(401).json({ error: "Missing email and/or password" });
       return;
   }
   // Get user from the database
   Customer.findOne({ email: req.body.email }, function (err, customer) {
       if (err) {
           res.status(400).send(err);
       }
       else if (!customer) {
           // Username not in the database
           res.status(401).json({ error: "Login failure!!" });
       }
       else {
           if (bcrypt.compareSync(req.body.password, customer.passwordHash)) {
               const token = jwt.encode({ email: customer.email }, secret);
               //update user's last access time
               customer.lastAccess = new Date();
               customer.save((err, customer) => {
                   console.log("User's LastAccess has been update.");
               });
               // Send back the token and role
               res.status(201).json({
                success: true,
                token: token,
                role: customer.role, // Include the role
                msg: "Login success"
            });
           }
           else {
               res.status(401).json({ success: false, msg: "Email or password invalid." });
           }
       }
   });
});

// please fiil in the blanks
// see javascript/account.js for ajax call
// see Figure 9.3.5: Node.js project uses token-based authentication and password hashing with bcryptjs on zybooks

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
        Customer.findOne({ email: decoded.email }, "email role lastAccess", function (err, user) {
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
 
// Update user's password
router.put("/updatePassword", function (req, res) {
    const { email, currentPassword, newPassword } = req.body;
    console.log("Request Data:", req.body);

    if (!email ||  !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, msg: "Missing email, current password, or new password." });
    }

    Customer.findOne({ email: email }, function (err, customer) {
        if (err) {
            return res.status(500).json({ success: false, msg: "Database error." });
        }

        if (!customer) {
            return res.status(404).json({ success: false, msg: "User not found." });
        }

        if (!bcrypt.compareSync(currentPassword, customer.passwordHash)) {
            return res.status(401).json({ success: false, msg: "Current password is incorrect." });
        }

        // Update password hash
        customer.passwordHash = bcrypt.hashSync(newPassword, 10);
        customer.save(function (err) {
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

    Customer.findOne({ email: email }, function (err, customer) {
        if (err) {
            return res.status(500).json({ success: false, msg: "Database error." });
        }

        if (!customer) {
            return res.status(404).json({ success: false, msg: "User not found." });
        }

        // Compare the provided password with the stored password hash
        if (!bcrypt.compareSync(password, customer.passwordHash)) {
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

    Customer.findOne({ email: email }, function (err, customer) {
        if (err) {
            return res.status(500).json({ success: false, msg: "Database error." });
        }

        if (!customer) {
            return res.status(404).json({ success: false, msg: "User not found." });
        }

        // Update devices
        customer.devices = devices;
        customer.save(function (err) {
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

    Customer.findOne({ email: email }, "devices", function (err, customer) {
        if (err) {
            return res.status(500).json({ success: false, msg: "Database error." });
        }

        if (!customer) {
            return res.status(404).json({ success: false, msg: "User not found." });
        }

        res.status(200).json({ success: true, devices: customer.devices });
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
        Customer.findOne({ email: userEmail }, 'role', function (err, user) {
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
            Customer.find({ role: 'Physician' })
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
    const { email, physicianName } = req.body; // We're using physicianName instead of physicianEmail

    // Check if both email and physicianName are provided
    if (!email || !physicianName) {
        console.error("Missing email or physicianName. Request body:", req.body);
        return res.status(400).json({ success: false, msg: "Email and physician name are required." });
    }

    console.log(`Attempting to find patient with email: ${email}`);

    // Find the patient by email
    Customer.findOne({ email: email, role: 'Patient' }, function (err, patient) {
        if (err) {
            console.error("Database error while finding patient:", err.message);
            return res.status(500).json({ success: false, msg: "Database error" });
        }

        if (!patient) {
            console.log(`Patient with email ${email} not found.`);
            return res.status(404).json({ success: false, msg: "Patient not found" });
        }

        console.log(`Found patient with email: ${patient.email}`);

        // Find the physician by name (instead of email)
        console.log(`Attempting to find physician with name: ${physicianName}`);

        Customer.findOne({ name: physicianName, role: 'Physician' }, function (err, physician) {
            if (err) {
                console.error("Database error while finding physician:", err.message);
                return res.status(500).json({ success: false, msg: "Database error" });
            }

            if (!physician) {
                console.log(`Physician with name ${physicianName} not found.`);
                return res.status(404).json({ success: false, msg: "Physician not found" });
            }

            console.log(`Found physician with name: ${physician.name}, email: ${physician.email}`);

            // Assign the physician's email to the patient's physicians field
            patient.physicians = physician.name; // Store the physician's email in the physicians field

            console.log(`Assigning physician with email ${physician.email} to patient with email ${patient.email}`);

            // Save the updated patient record
            patient.save(function (err) {
                if (err) {
                    console.error("Error saving patient record:", err.message);
                    return res.status(500).json({ success: false, msg: "Error saving patient record" });
                }

                console.log(`Successfully assigned physician to patient. Patient email: ${patient.email}, Physician email: ${physician.email}`);

                // Send success response
                res.status(200).json({ success: true, msg: "Physician assigned successfully" });
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
    Customer.findOne({ email: patientEmail }, 'physicians', function (err, patient) {
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










module.exports = router;