const db = require("../db");
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['Patient', 'Physician'], required: true },
    devices: [
        {
            type: { type: String },
            name: { type: String }
        }
    ],
    lastAccess: { type: Date, default: Date.now },
    // Attributes specific to Physicians
    name: { type: String, required: function () { return this.role === 'Physician'; } },
    
    // Attributes specific to Patients
    physicians: {
        type: String, required: function () { return this.role === 'Patient'; }
    },
});

 const Customer = db.model("Customer", customerSchema);

module.exports = Customer;