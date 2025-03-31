document.getElementById("search-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const query = document.getElementById("search-input").value;
    fetchSearchResults(query);
});

const selectedCourses = [];

async function fetchSearchResults(query) {
    const response = await fetch(`/api/courses/search?query=${query}`);
    const courses = await response.json();
    displayResults(courses);
}

function displayResults(courses) {
    const resultsDiv = document.getElementById("search-results");
    resultsDiv.innerHTML = ''; // Clear previous results
    
    if (courses.length === 0) {
        resultsDiv.innerHTML = "<p>No results found</p>";
        return;
    }

    courses.forEach(course => {
        // Create container for the result item
        const div = document.createElement("div");
        div.classList.add("search-item");

        // Create a checkbox for the course
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = course.code;
        checkbox.dataset.courseName = course.name; // Store name in data attribute

        // Add checkbox and course info to the div
        div.appendChild(checkbox);
        div.appendChild(document.createTextNode(` ${course.code}: ${course.name}`));

        // Append the div to results
        resultsDiv.appendChild(div);
    });
}

// Submit selected courses to the list
document.getElementById("submit-btn").addEventListener("click", function() {
    const checkboxes = document.querySelectorAll("#search-results input[type='checkbox']:checked");
    
    selectedCourses.length = 0; // Clear the list before updating

    checkboxes.forEach(checkbox => {
        selectedCourses.push({
            code: checkbox.value,
            name: checkbox.dataset.courseName
        });
    });

    updateSelectedCoursesList();
});

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

// Function to load all courses into a dropdown
async function loadCourses() {
    const response = await fetch("/api/courses");
    const courses = await response.json();
    const dropdown = document.getElementById("course-dropdown");

    // Clear existing options except the placeholder
    dropdown.innerHTML = `<option value="" disabled selected>Select a course...</option>`;

    // Add courses to dropdown
    courses.forEach(course => {
        const option = document.createElement("option");
        option.value = course.code;
        option.textContent = `${course.code} - ${course.name}`;
        dropdown.appendChild(option);
    });
}

// Load courses when the page loads
window.onload = loadCourses;
