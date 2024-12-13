const express = require('express');
const cors = require('cors'); // Import CORS middleware
var router = express.Router();
var User = require("../models/users");
const fetch = require('node-fetch');
const { stringify } = require('querystring');



//const Particle = require('particle-api-js');
//const toDevice = new Particle();

//include in app.js:
// app.use(cors());
// app.use(express.json());

const API_KEY = '229baa4b-6042-4e7b-8f59-ec59bd7f4d57'; //Put this somewhere on the site, for user to put in their webhook?

//Webhook to recieve the data from the device
router.post('/webhook', async (req,res) =>{

    const { API_Key } = req.body; // Extract only the API_Key from the request body

    // Check if API Key is valid
    const isValidApiKey = API_Key === API_KEY;

    // Log the request body and validation result
    console.log('Received JSON:', JSON.stringify(req.body, null, 4));
    console.log('Validation Result:', isValidApiKey ? 'Success' : 'Failure');

   if(isValidApiKey){
        const jsonObj = req.body; 
        
        //incoming JSON:       
        //"API_Key":"229baa4b-6042-4e7b-8f59-ec59bd7f4d57",
        // "event": "{{{PARTICLE_EVENT_NAME}}}",
        // "data": "{{{PARTICLE_EVENT_VALUE}}}",
        // "coreid": "{{{PARTICLE_DEVICE_ID}}}",
        // "published_at": "{{{PARTICLE_PUBLISHED_AT}}}"

        //"data": "{\BPM\ :beatPerMinute),\O2\: o2Value}" 

        User.findOne({'devices.0.id': jsonObj.coreid}, function(err,user){
            
            if (err) {
                return res.status(500).json({ success: false, msg: "Database error." });
            }

            if (!user) {
                return res.status(404).json({ success: false, msg: "User not found." });
            }
           //console.log("finds id");
            
            const data = JSON.parse(jsonObj.data);

            //Add new sensor readings to the User's sensorReadings array
            user.sensorReadings.push({
                heartRate: {
                    date: jsonObj.published_at,
                    bpm: data.BPM  //Correct way to access an json obj in an json obj??
                },
                oxygenSaturation: {
                    date: jsonObj.published_at,
                    o2: data.O2
                }
            });
            //console.log(user.email);
            //console.log(user.devices[0].id);

            user.save(function (saveErr) {
                if (saveErr) {
                    console.error("Error saving data:", saveErr.message);
                    return res.status(500).json({ success: false, msg: "Failed to save data" });
                }
                console.log("data saved");
                // Respond with success
                res.status(200).json({ success: true, msg: "Data recieved" });
            });

        })
    }
    else{
        res.status(403).json({
          message: 'Failure: Invalid API Key',
          received: req.body, // Echo back the full received JSON
        });
    }
});


    
    //What the device can read:
    // {   "Wait": waitTimeVAl
    //     "Start": startTimeHour
    //     "End": EndTimeHour  }

function sendData(deviceID, token, freq, startTime, endTime) {

    //const webhookURL = "https://api.particle.io/v1/devices/"+{deviceID}+"/reading"; //...devices/${deviceID}/${functionName} currently hard coded as reading

    const freqSend = {W:freq};
    const startSend = {S:startTime};
    const endSend = {E:endTime};


    // const header = {
    //     'Content-Type': 'application/json',
    //     'Accept': 'application/json',
    // };
    //Eli token: c204b1548c6579856d9382ae1f45531f2181983b

    const urlFreq = `https://api.particle.io/v1/devices/${deviceID}/freq`;
    const urlStart = `https://api.particle.io/v1/devices/${deviceID}/start`;
    const urlEnd = `https://api.particle.io/v1/devices/${deviceID}/end`;

    fetch(urlFreq, { //send frequency update
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(freqSend)
    })
    .then(response => response.json())
    .then(particleResponse => {
        console.log("Particle response:", particleResponse);
    })
    .catch(error => {
        console.log("Particle error:", error);
    });

    fetch(urlStart, {    //send start time
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(startSend)
    })
    .then(response => response.json())
    .then(particleResponse => {
        console.log("Particle response:", particleResponse);
    })
    .catch(error => {
        console.log("Particle error:", error);
    });

    fetch(urlEnd, {    //send end time
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(endSend)
    })
    .then(response => response.json())
    .then(particleResponse => {
        console.log("Particle response:", particleResponse);
    })
    .catch(error => {
        console.log("Particle error:", error);
    });
    
}




module.exports = {
    router,
    sendData
};
