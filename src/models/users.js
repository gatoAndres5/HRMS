const db = require("../db");
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['Patient', 'Physician'], required: true },
    devices: [
        {
            id: { type: String },
            accessToken: { type: String }
        }
    ],
    lastAccess: { type: Date, default: Date.now },
    name: { type: String},
    
    // Attributes specific to Patients
    physicians: {
        type: String, required: function () { return this.role === 'Patient'; }
    },
    // Attributes specific to Patients
    patients: [{
        type: String, required: function () { return this.role === 'Physician'; }
    }
    ],
    // Only Patients will have a single measurement object
    measurements: {
        startTime: { type: String },
        endTime: { type: String },
        frequency: { type: Number }
    },
    sensorReadings: [{
        heartRate: {
            date: {type: Date},
            bpm: {type: Number}
        },
        oxygenSaturation: {
            date: {type: Date},
            o2: {type: Number}
        }
    }
    ]
});

 const user = db.model("Users", userSchema);

module.exports = user;