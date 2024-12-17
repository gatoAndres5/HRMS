University of Arizona 2024 Fall ECE413/513
Final Project - Team 17
======

**Team members:**

- Todd Peterson
- Andres Galvez
- Eli Jacobson
- Tej Scott

Demo:
---------
- Demo URL: [\\[Provide your project link running on AWS.\\]](https://ec2-3-16-163-141.us-east-2.compute.amazonaws.com:8443)
- Test Information: 

Test Patient Account Information: 
- Email: test1@gmail.com
- Password: 1234567890!aA

Test Physician Account Information:
- Email: test2@gmail.com
- Password: 1234567890!aA

Videos:
---------
- Pitch Video: \[PROVIDE YOUR YOUTUBE VIDEO LINK HERE\]
- User Experience: https://www.youtube.com/embed/5XalxlUgyXA
- Code Implements: https://www.youtube.com/embed/9jIQSuuuGYE

## Get Started
---------
How to install and launch your project.

### Install Dependencies

npm install 
- This command installs all the necessary dependencies listed in the `package.json` file. It ensures all the required modules are downloaded and ready for use in your project.

### Start the Server

cd src
- This command changes the directory to the 'src' directory.

nvm install 16
- This command install node version manager 16 so that the application can properly run.

npm start
- This command runs the application. It starts the Express server, allowing you to access your project at  `https://ec2-3-16-163-141.us-east-2.compute.amazonaws.com:8443`. You can view the Heart Rate Monitoring System (HRMS) by visiting this URL.




Require Modules
----------

| Module | Description |
| --- | --- |
| [Materialize CSS](https://materializecss.com) | A modern front-end framework based on Google's Material Design principles, providing responsive and sleek UI components. |
| [Google Icon Font](https://fonts.google.com/icons) | A library of Material Design icons provided by Google, used to enhance UI design with easily customizable icons. |
| [Node.js Express](https://expressjs.com) | A popular server-side framework for building web applications with Node.js, providing easy routing and middleware handling. |
| [Body-Parser](https://www.npmjs.com/package/body-parser) | A Node.js middleware for parsing incoming request bodies, especially useful for handling JSON and URL-encoded data in POST requests. |
| [http-errors](https://www.npmjs.com/package/http-errors) | A Node.js library that simplifies the creation of HTTP error objects, helping to manage and return errors in web applications. |
| [CORS Middleware](https://www.npmjs.com/package/cors) | Middleware for enabling Cross-Origin Resource Sharing (CORS), allowing resources to be shared between different domains. |
| [Node-Fetch API](https://www.npmjs.com/package/node-fetch) | A lightweight library for making HTTP requests on the server-side, allowing you to interact with REST APIs like Particle REST API. |
| [MAX30102 Sensor](https://github.com/sparkfun/SparkFun_MAX3010x_Sensor_Library) | A C++ library for reading data from the MAX30102 sensor, often used in heart rate monitoring applications. |

APIs
----------

- API Class 1 – Route: routes/users/\*

| APIs                       | Description                                                                                  | HTTP Method |
| -------------------------- | -------------------------------------------------------------------------------------------- | ----------- |
| `/signUp`                  | Sign up a new user (either Patient or Physician). Includes validation of input and password hashing. | `POST`      |
| `/logIn`                   | Log in an existing user. Returns a JWT token and user role if credentials are correct.        | `POST`      |
| `/status`                  | Get user details (email, role, name, patients, measurements, lastAccess) based on a valid JWT token in the `X-Auth` header. | `GET`       |
| `/patient`                 | Get patient information based on a provided `patient` query parameter. Requires valid JWT in `X-Auth` header. | `GET`       |
| `/updatePassword`          | Update the user's password. Requires the current password and the new password.              | `PUT`       |
| `/validatePassword`        | Validate the current password for a user.                                                    | `POST`      |
| `/updateDevices`           | Update a user's list of devices.                                                             | `PUT`       |
| `/getDevices`              | Get a user's list of devices by their email.                                                 | `GET`       |
| `/getUserEmail`            | Retrieve the email of the authenticated user from the JWT token.                             | `GET`       |
| `/getPhysicians`           | Fetch a list of physicians. Access is restricted to users with the role of `Patient` or `Physician`. | `GET`       |
| `/assignPhysician`         | Assign a physician to a patient. Requires both `email` (patient) and `physicianName`.        | `PUT`       |
| `/getAssignedPhysician`    | Get the assigned physician for a given patient based on their email.                          | `GET`       |
| `/submitMeasurement`       | Submit measurement preferences for a user, including time range and frequency.               | `POST`      |
| `/getSensorReadings`       | Fetch sensor readings for the authenticated user or a specified patient.                     | `GET`       |


- API Class 2 – Route: routes/particle-webhook/\*

| APIs                       | Description                                                                     | HTTP Method |
| -------------------------- | ------------------------------------------------------------------------------- | ----------- |
| `/webhook`                 | Receives sensor data via a webhook, validates the API key, and updates user readings. | `POST`      |


......

Project file structure description
----------

| Folder/File        | Description                                                                 | Note                                |
| -------------------| --------------------------------------------------------------------------- | ----------------------------------- |
| `pulseoximeter/`   | Root folder for an example pulse oximeter project.                                | Main project example directory.            |
| `server/`          | Contains server-side scripts and logic for the example project in pulseoximeter                                  | Backend implementation of example project.            |
| `src/`             | Main source code folder.                                                   | Includes hardware, bin, etc.       |
| `src/bin/`             | Contains binary files or executable scripts.                                                   | Essential for running the server.       |
| `src/Hardware`       | Contains files related to hardware interaction (e.g., device setup).| Includes sensor configuration.  |
| `src/models/`          | Contains data models for the project.                                      | Defines database schemas.          |
| `src/public/`          | Contains publicly accessible assets like images and scripts.               | Client-side resources.             |
| `src/routes/`          | Defines the server-side API routes.                                        | Handles application routing.       |
| `src/videos/`          | Folder containing video files.                                             | Demonstrations and walkthroughs.   |
| `src/views/`           | Frontend views or templates for the project.                               | Renders the user interface.        |
| `src/.hintrc`          | Configuration file for linting or IDE hints.                               | Code styling configuration.        |
| `src/app.js`           | Main application script for the server.                                    | Entry point for the Node.js app.   |
| `src/db.js`            | Script for database setup and connection.                                  | Manages database interactions.     |
| `src/package-lock.json`| Auto-generated lock file for npm dependencies.                             | Ensures dependency consistency.    |
| `src/package.json`     | Metadata and dependencies for the Node.js project.                         | Manages npm packages.              |
| `.gitignore`       | Specifies files/folders to be ignored by Git.                              | Excludes unnecessary files like `node_modules`. |
| `README.md`        | Main documentation for the project.                                        | Explains project setup and usage.  |
| `ECE_413_513_Final_Project_Description` | Document detailing the final project for the course.                     | Project description file.          |
| `ECE_413_513 Project Documentation.pdf` | Document detailing the project documentation.                     | Project documentation file.          |

