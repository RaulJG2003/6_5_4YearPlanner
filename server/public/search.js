document.getElementById("search-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const query = document.getElementById("search-input").value;
    fetchSearchResults(query);
});

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
        const div = document.createElement("div");
        div.innerHTML = `<strong>${course.code}</strong>: ${course.name}`;
        resultsDiv.appendChild(div);
    });
}

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