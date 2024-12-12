University of Arizona [2024 Fall ECE413/513]\
Final Project - Team X
======

\[Please briefly state the function and purpose of this Git Repo\]\
You can flexibly change this Readme.md file according to your needs.

**Team members:**

- Member 1
- Member 2
- Member 3

Demo:
---------
- Demo URL: \[Provide your project link running on AWS.\]
- Test Infomation: \[Please provide the test account information and the info about how to update device value.\]

Videos:
---------
- Pitch Video: \[PROVIDE YOUR YOUTUBE VIDEO LINK HERE\]
- User Experience: \[PROVIDE YOUR YOUTUBE VIDEO LINK HERE\]
- Code Implements: \[PROVIDE YOUR YOUTUBE VIDEO LINK HERE\]

Get Start
---------
Example how to install and launch your project.
```
Command Block 1 Example
```
Explain each command and what it is used for.
```
Command Block 2 Example
```

Require Modules
----------
Please fill in all the modules you use in the project and make them hyperlinked and describe it. 

| Module | Description |
| --- | --- |
| [Module 1](https://) | ... |
| [Module 2](https://) | ... |
| [Module 3](https://) | ... |
| [Module 4](https://) | ... |
| [Module 5](https://) | ... |
| [Module 6](https://) | ... |
| [Module 7](https://) | ... |

APIs
----------

- API Class 1 – Route: /users/\*

|APIs|Description|HTTP Method|
| :- | :- | :- |
|/signUp|Registers a new user with provided details (email, password, role, devices, etc.)|POST|
|/logIn|Logs in an existing user by validating email and password, and returns a JWT token|POST|
|/status|Checks the user's authentication status by decoding the JWT token and returns user details|GET|
|/patient|Fetches patient information by name (requires X-Auth header with JWT)|GET|
|/updatePassword|Updates the user's password after validating the current password|PUT|
|/validatePassword|Validates the user's current password against the database|POST|
|/updateDevices|Updates the devices array for a user|PUT|
|/getDevices|Fetches the devices associated with the user's email|GET|
|/getUserEmail|Retrieves the user's email from the JWT token|GET|
|/getPhysicians|Fetches a list of physicians from the database (requires valid JWT)|GET|
|/assignPhysician|Assigns a physician to a patient based on email and physician's name|PUT|
|/getAssignedPhysician|Fetches the assigned physician for a given patient by email|GET|
|/submitMeasurement|Submits a measurement for a user (time range, frequency, etc.)|POST|

- API Class 2 – Route: /Route2/\*

......

- API Class 3 – Route: /Route3/\*

......

Project file structure description
----------
- Please use .gitignore to exclude the "node_module" folder and other unnecessary files to keep the Project clean.
- Please include your package.json and package-lock.json files so that others can install dependent modules through these two files when they download your Project.

|Folder|Description|Note|
| :- | :- | :- |
|Folder 1|Description 1|Note 1|
|Folder 2|Description 2|Note 2|
|Folder 3|Description 3|Note 3|
|Folder 4|Description 4|Note 4|