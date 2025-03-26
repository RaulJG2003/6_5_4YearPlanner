# 6_5_4YearPlanner
**UMBC Four Year Planner Project - Interactive Courses Planner for Incoming and Current Students** to complete their program. This product will be an interactive website.

## Overview
UMBC needs an interactive 4-year course planning tool to replace the current static document, allowing students to customize their academic plan based on advisor recommendations, personal preferences, and AP credits.

### Key Features
* **Customizable Course Plan**: Modify the advising plan dynamically to reflect individual choices and prior credits.
* **Drag-and-Drop Interface**: Users can easily move courses between semesters by dragging and dropping them, facilitating quick adjustments to their academic plans.
* **Course Availability Insights**: Notes from senior students on course demand to help secure seats in popular classes.
* **Semester Offering Predictions**: Estimate the likelihood of a course being available in summer or winter based on past catalogs.
* **Credit Load Guidance**: Recommendations on optimal credit hours per semester.
* **Prerequisite Tracking**: Ensure students follow the correct course sequence, aligning with prerequisite requirements.

The tool will enhance academic planning without professor recommendations, leaving that choice to student research.

## Demo
## Setup
### Step 1: Download MongoDB
[Link to download MongoDB Community Server](https://www.mongodb.com/try/download/community)
### Step 2: Download Node.js
[Link to download Node.js](https://nodejs.org/en)
### Step 3: Download Git (if necessary)
[Link to download git for Windows](https://git-scm.com/downloads/win)
### Step 3: Clone GitHub Repository
Once you have Git installed, navigate to a local folder location where you want the local repository to be stored and type, ```git clone https://github.com/RaulJG2003/6_5_4YearPlanner.git```. This should clone the repository to allow for local development in your computer. If the repository name has changed, clone the repository using the respective changed name.
### Step 4: How to view website with preliminary data
* In the GitHub repository, in the ```/server``` folder type the following command: ```node server.js```. This will initiate the backend. You should see a ```MongoDb connected...``` message.
* Afterwards, navigate to the ```/server/scripts``` folder, and type in the command ```node seed.js```. This will seed the database with data that can be used in the frontend.
* Finally, type ```http://localhost:5000``` on a browser and hit enter. You should see the website, quite barebones.
### Debugging:
#### MongoDB Cluster and IP Address issue
If MongoDB does not connect after running ```node server.js```, and a message shows up that mentions whitelisting your ip address, this means that your ip address neeeds to be added to the MongoDB Cluster we have created for this project. To do this navigate to [Cloud MongoDB website here](cloud.mongodb.com), and be sure that you are in our ```StudentData``` cluster. On the left, under ```Security``` click on ```Network Access```. You should immediately see your IP Address show up, and on the right, click on ```Add IP Address```. You should now repeat **Step 4** from above.
## Tech Stack
* HTML (for structure)
* CSS (Bootstrap)
* JavaScript (React.js for reactivity, D3.js for visualization, jQuery UI for drag and drop)
* Backend (potentially Node.js with database like MongoDB)
## Usage
## Contribution
Rusham Bhatt - UMBC Computer Science

Boma Braide - UMBC Computer Science

Raul Jorrin Garcia - UMBC Computer Science

Michael Moore - UMBC Computer Science
