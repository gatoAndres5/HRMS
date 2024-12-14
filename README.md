University of Arizona [2024 Fall ECE413/513]\
Final Project - Team 17
======

\[Please briefly state the function and purpose of this Git Repo\]\
You can flexibly change this Readme.md file according to your needs.

**Team members:**

- Todd Peterson
- Andres Galvez
- Eli Jacobson
- Tej Scott

Demo:
---------
- Demo URL: \[Provide your project link running on AWS.\]
- Test Infomation: \[Please provide the test account information and the info about how to update device value.\]

Videos:
---------
- Pitch Video: \[PROVIDE YOUR YOUTUBE VIDEO LINK HERE\]
- User Experience: \[PROVIDE YOUR YOUTUBE VIDEO LINK HERE\]
- Code Implements: \[PROVIDE YOUR YOUTUBE VIDEO LINK HERE\]

## Get Started
---------
Example how to install and launch your project.

### Install Dependencies

npm install
- This command installs all the necessary dependencies listed in the `package.json` file. It ensures all the required modules are downloaded and ready for use in your project.

### Start the Server

npm start
- This command runs the application. It starts the Express server, allowing you to access your project at  `https://ec2-3-16-163-141.us-east-2.compute.amazonaws.com:8443`. You can view the Heart Rate Monitoring System (HRMS) by visiting this URL.




Require Modules
----------
Please fill in all the modules you use in the project and make them hyperlinked and describe it. 

| Module | Description |
## Require Modules
----------
Please fill in all the modules you use in the project and make them hyperlinked and describe it.

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

- API Class 1 – Route: /users/\*

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


- API Class 2 – Route: /Route2/\*

......

- API Class 3 – Route: /Route3/\*

......

Project file structure description
----------
- Please use .gitignore to exclude the "node_module" folder and other unnecessary files to keep the Project clean.
- Please include your package.json and package-lock.json files so that others can install dependent modules through these two files when they download your Project.

| Folder           | Description                                                                 | Note                                |
| ---------------- | --------------------------------------------------------------------------- | ----------------------------------- |
| `bin`            | Contains binary files or executable scripts.                               | Essential for running the server.  |
| `Hardware`       | Likely contains files related to hardware interaction (e.g., device setup).| Can include sensor configuration.  |
| `keys`           | Contains sensitive API keys or credentials.                                | Secure storage for authentication. |
| `models`         | Contains data models for the application (e.g., user, sensor data).        | Represents the app's database schema.|
| `node_modules`   | Node.js dependencies for the project.                                      | Generated by `npm install`.        |
| `public`         | Publicly accessible files, such as images, styles, and scripts.             | Used for client-side resources.    |
| `routes`         | Defines the routes (API endpoints) for the server.                         | Handles the server-side requests.  |
| `views`          | Contains the frontend templates or views (e.g., for rendering HTML).       | Used with templating engines.      |
| `.hintrc`        | Configuration file for linting or IDE hints.                               | Defines code style rules.         |
| `app.js`         | Main application script that runs the server.                              | Entry point for the Node.js app.   |
| `db.js`          | Database connection or model setup.                                        | Defines DB interaction logic.      |
| `package-lock.json` | Lock file for npm dependencies to ensure consistency.                     | Generated by npm.                  |
| `package.json`   | Contains metadata and dependencies for the Node.js project.                | Defines project dependencies.      |
| `.gitignore`     | Specifies files to be ignored by Git version control.                      | Keeps sensitive or unnecessary files out of Git. |
| `README.md`      | Project documentation file.                                                | Describes the project, setup, and usage. |
| `ECE_413_513_Final_Project_Description` | A description document for the final project.                  | Provides details for course project.|
