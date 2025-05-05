// Function for the class search 
document.getElementById("search-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const query = document.getElementById("search-input").value;
    fetchSearchResults(query);
});

const selectedCourses = []; // Array to hold the course objects that the user has already taken

// Function to fetch search results
async function fetchSearchResults(query) {
    const response = await fetch(`/api/courses/search?query=${query}`);
    const courses = await response.json();
    displayResults(courses);
}

// Function to display search results
function displayResults(courses) {
    console.log("Displaying results");
    const resultsDiv = document.getElementById("search-results");
    resultsDiv.innerHTML = ''; 
    
    if (courses.length === 0) {
        resultsDiv.innerHTML = "<p>No results found</p>";
        return;
    }

    courses.forEach(course => {
        const div = document.createElement("div");
        div.classList.add("search-item");

        // Create checkbox and add event listener for checking/unchecking
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = course.code;
        checkbox.dataset.courseName = course.name;

        // Check if the course is already selected
        if (selectedCourses.some(c => c.code === course.code)) {
            checkbox.checked = true;
        }

        checkbox.addEventListener("change", () => {
            handleCheckboxChange(checkbox, course);
        });

        // Add checkbox and course info to the div
        div.appendChild(checkbox);
        div.appendChild(document.createTextNode(` ${course.code}: ${course.name}`));

        resultsDiv.appendChild(div);
    });
}

// Handle checkbox change, checked or unchecked before submission
function handleCheckboxChange(checkbox, course) {
    if (checkbox.checked) {
        addCourse(course);
    } else {
        removeCourse(course);
    }
    updateSelectedCoursesList();
}

// Add course to the selected courses array
function addCourse(course) {
    selectedCourses.push(course);
}

// Remove course from the selected courses array
function removeCourse(course) {
    const index = selectedCourses.findIndex(c => c.code === course.code);
    if (index !== -1) {
        selectedCourses.splice(index, 1);
    }
}

// Update the display of selected courses dynamically before submission
function updateSelectedCoursesList() {
    const listDiv = document.getElementById("selected-courses");
    listDiv.innerHTML = ''; // Clear previous entries

    if (selectedCourses.length === 0) {
        listDiv.innerHTML = "<p>No courses selected</p>";
        return;
    }

    const ul = document.createElement("ul");
    selectedCourses.forEach(course => {
        const li = document.createElement("li");
        li.textContent = `${course.code}: ${course.name}`;
        ul.appendChild(li);
    });

    listDiv.appendChild(ul);
}


// Store values of input fields in variables for later use 
function storeInputValues() {
    const year = document.getElementById("Year").value;
    const semester = document.getElementById("Semester").value;
    const major = document.getElementById("Major").value;
    const minor = document.getElementById("Minor").value;
    const creditsTaken = document.getElementById("credits-input").value;  // For the credits input field
    const mathPlacement = document.getElementById("math-placement").value

    // Log the stored values for debugging
    console.log("Stored Input Values:");
    console.log(`Year: ${year}`);
    console.log(`Semester: ${semester}`);
    console.log(`Major: ${major}`);
    console.log(`Minor: ${minor}`);
    console.log(`Credits Taken: ${creditsTaken}`);
    console.log(`Math Placemnet: ${mathPlacement}`);

    // Return the values as an object (or you can use them for other purposes)
    return {
        year,
        semester,
        major,
        minor,
        creditsTaken, 
        mathPlacement
    };
}


// Dynamically updates the display for the courses the user has already taken
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded.");
    const searchResults = document.getElementById("search-results");
    const selectedCoursesDiv = document.getElementById("selected-courses");

    // Function to update selected courses display
    function updateSelectedCourses(checkbox, course) {
        if (checkbox.checked) {
            selectedCourses.push(course);
        } else {
            selectedCourses = selectedCourses.filter(c => c.code !== course.code);
        }
        displaySelectedCourses();
    }

    // Display the selected courses in the selected-courses div
    function displaySelectedCourses() {
        if (selectedCourses.length === 0) {
            selectedCoursesDiv.innerHTML = "No courses selected";
        } else {
            selectedCoursesDiv.innerHTML = selectedCourses.map(c => `${c.name} (${c.code})`).join(", ");
        }
    }
});


// Function used for debugging the users input values, requires a button "debug-btn"
function debugUserInfo() {
    const year = document.getElementById("Year").value;
    const semester = document.getElementById("Semester").value;
    const major = document.getElementById("Major").value;
    const minor = document.getElementById("Minor").value;
    const creditsTaken = document.getElementById("credits-input").value;  // For the credits input field

    console.log("---- User Information Debug ----");
    console.log(`Year: ${year}`);
    console.log(`Semester: ${semester}`);
    console.log(`Major: ${major}`);
    console.log(`Minor: ${minor}`);
    console.log(`Credits Taken: ${creditsTaken}`);
    
    console.log("---- Selected Courses Debug ----");
    selectedCourses.forEach(course => {
        console.log(`Course Code: ${course.code}, Course Name: ${course.name}`);
    });
    
    console.log("--------------------------------");
}

function validateInputs() {
    const creditsTaken = parseInt(document.getElementById("credits-input").value, 10);
    const mathPlacement = parseInt(document.getElementById("placement-input").value, 10);
    const year = document.getElementById("Year").value;
    const semester = document.getElementById("Semester").value;
    const major = document.getElementById("Major").value;
    const minor = document.getElementById("Minor").value;

    let isValid = true;
    let errors = [];

    const errorDiv = document.getElementById("error-message");
    errorDiv.style.display = "none";
    errorDiv.innerHTML = "";

    if (isNaN(creditsTaken) || creditsTaken < 0 || creditsTaken > 200) {
        errors.push("Credits Taken must be a number between 0 and 200.");
        isValid = false;
    }

    if (isNaN(mathPlacement) || mathPlacement < 0 || mathPlacement > 100) {
        errors.push("Math Placement must be a number between 0 and 100.");
        isValid = false;
    }

    if (!year || year === "What year are you?") {
        errors.push("Please select a valid Year.");
        isValid = false;
    }

    if (!semester || semester === "What semester are you in currently?") {
        errors.push("Please select a valid Semester.");
        isValid = false;
    }

    if (!major || major === "What major are you?") {
        errors.push("Please select a valid Major.");
        isValid = false;
    }

    if (!minor || minor === "Do you have a minor?") {
        errors.push("Please select a valid Minor.");
        isValid = false;
    }

    if (!isValid) {
        // Build the HTML unordered list
        const ul = document.createElement("ul");
        errors.forEach(err => {
            const li = document.createElement("li");
            li.textContent = err;
            ul.appendChild(li);
        });

        errorDiv.appendChild(ul);
        errorDiv.style.display = "block";
    }

    return isValid;
}

document.getElementById("debug-btn").addEventListener("click", debugUserInfo);

// Load courses when the page loads
window.onload = loadCourses;