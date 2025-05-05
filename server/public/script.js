let allCourses = [];
let requirements = [];

const csvPaths = {
    bta: "/bta.csv",
    cs: "/compsci.csv",
    is: "/infosys.csv",
    cheme: "/chemical engineering/ceTrad.csv",
};
const planPaths ={
    bta: "/btaGP.csv",
    cs: "/csGP.csv",
    is: "/isGP.csv",
    cheme: "/chemeGP.csv"

}

$(document).ready(() => {
    const buttonContainer = $("#course-buttons");
    // Extract major from URL (e.g., "COMPSCI" from index.html?major=COMPSCI)
    const urlParams = new URLSearchParams(window.location.search);
    const major = urlParams.get("major")?.toLowerCase(); // Convert to lowercase to match csvPaths keys
    if (major) {
        // Replace the hardcoded "cheme" with the dynamic major
        console.log("success!") // Now loads the correct plan based on user selection
    } else {
        console.error("No major selected!");
        // Fallback to a default major if needed
        major = 'cs'; // Default to Computer Science
    }
    $.get("/api/courses", function (data) {
        allCourses = data;
        renderCourses(allCourses);
        updateDegreeAndLoadCSV(major); // SUPPOSED TO GET VALUE FROM DROPDOWN, NEEDS TO BE CHANGED

        const savedCourses = JSON.parse(localStorage.getItem("selectedCourses") || "[]");

        if (savedCourses.length > 0) {
            savedCourses.forEach(code => {
                const course = allCourses.find(c => c.code === code);
                if (course) {
                    // Your logic to re-render the course
                    // (example: recreate and drop into correct semester)
                }
            });
        }

    });
    // Puts the course rendering into a function so that it can be used in different ways
    function renderCourses(courseList) {
        buttonContainer.empty();

        courseList.forEach((course, index) => {
            const button = $(`<div class="course-button" data-code="${course.code}" data-credits="${course.credits}">`)
                .text(`${course.code} - ${course.name}`)
                .click(function () {
                    if (!$(this).hasClass("dragging")) {
                        $(`#dropdown-${index}`).toggle();
                        $(this).toggleClass('active');
                    }
                });

            const dropdown = $(`
                <div class="dropdown-content" id="dropdown-${index}">
                    <strong>Code:</strong> ${course.code} <br>
                    <strong>Name:</strong> ${course.name} <br>
                    <strong>Credits:</strong> ${course.credits} <br>
                    <strong>Prerequisites:</strong> ${course.prerequisites.length > 0 ? course.prerequisites.join(", ") : "None"} <br>
                    <strong>Semester Offered:</strong> ${course.semesterOffered.join(", ")}
                </div>
            `);

            const classContainer = $("<div>").addClass("class-container");
            classContainer.append(button).append(dropdown);
            buttonContainer.append(classContainer);

            classContainer.draggable({
                helper: "clone",
                revert: "invalid",
                start: function () {
                    button.addClass("dragging");
                },
                stop: function () {
                    button.removeClass("dragging");
                }
            });
        });
        if (courseList.length === 0) {
            buttonContainer.html("<p>No courses found.</p>");
            return;
        }
    }

    $("#search-input").on("input", function () {
        const query = $(this).val().toLowerCase().trim();

        // Get all currently used course codes
        const usedCodes = new Set();
        $(".semester .course-button").each(function () {
            usedCodes.add($(this).data("code"));
        });

        // Filter out used courses from search
        const filteredCourses = allCourses.filter(course =>
            !usedCodes.has(course.code) && (
                course.code.toLowerCase().includes(query) ||
                course.name.toLowerCase().includes(query)
            )
        );

        renderCourses(filteredCourses);
    });

    function updateCreditsForSemester(semesterDiv) {
        let total = 0;

        // Sum credits from all class-containers inside this semester
        semesterDiv.find(".class-container").each(function () {
            const credits = parseInt($(this).find(".course-button").data("credits"));
            total += isNaN(credits) ? 0 : credits;
        });

        // Update the span that appears BEFORE the semester div
        const creditSpan = semesterDiv.closest(".semester-block").find(".credit-total");
        if (creditSpan.length) {
            creditSpan.text("Credits: " + total);
        }

        // If the user goes over 19 credits a warning message will come up
        const warningDiv = semesterDiv.closest(".semester-block").find(".credit-warning");
        warningDiv.remove(); // Always remove any existing warnings first

        if (total > 19) {
            semesterDiv.closest(".semester-block").append('<div class="credit-warning" style="color: red;">Warning: More than 19 credits is only allowed with special permission!</div>');
        } else if (total > 15) {
            semesterDiv.closest(".semester-block").append('<div class="credit-warning" style="color: gold;">Warning: More than 15 credits a semester is not recommended!</div>');
        }
    }
   
    function prerequisitesMet(course, semesterId) {

        if (!course || !Array.isArray(course.prerequisites)) return true;

        // If no prerequisites or only empty strings, it's considered met
        const filteredPrereqs = course.prerequisites.filter(p => p.trim() !== "");
        if (filteredPrereqs.length === 0) return true;

        const currentSemesterIndex = parseInt(semesterId.split('-')[1]);

        // Gather all the courses from semesters before the current one
        let takenCourses = new Set();
        for (let i = 1; i < currentSemesterIndex; i++) {
            $(`#semester-${i} .course-button`).each(function () {
                takenCourses.add($(this).data("code"));
            });
        }

        // Check if all prerequisites are in takenCourses
        return course.prerequisites.every(prereq => takenCourses.has(prereq));
    }

    // Make semesters droppable
    $(".semester").droppable({
        accept: ".class-container",
        drop: function (event, ui) {
            const semester = $(this);
            const original = ui.draggable;
            const button = original.find(".course-button");
            const code = button.data("code");

            // Prevent duplicates by checking if it already exists in the semester
            if (semester.find(`[data-code='${code}']`).length) return;

            // Remove from course offered section if it was already there
            $(`#course-buttons .class-container:has([data-code='${code}'])`).remove();

            // If there was a previous semester, remove it from that semester
            const prevSemester = ui.helper.closest(".semester");
            if (prevSemester.length) {
                prevSemester.find(`.class-container:has([data-code='${code}'])`).remove();
            }

            // Check if prerequisites are met
            const courseObj = allCourses.find(c => c.code === code);
            if (!prerequisitesMet(courseObj, semester.attr("id"))) {
                original.find(".course-button").css("background-color", "#f44336"); // red
                if (!original.find(".error-msg").length) {
                    original.append(`<div class="error-msg" style="color: red;">Missing prerequisites: ${courseObj.prerequisites.join(", ")}</div>`);
                }
            } else {
                original.find(".course-button").css("background-color", "gold");
                original.find(".error-msg").remove();
            }

            // Add the "X" remove button only if it hasn't been added yet
            if (!button.find(".remove-course").length) {
                button.append(` <button class="remove-course">X</button>`);
            }

            // Bind the remove button functionality
            button.find(".remove-course").on("click", function () {
                original.remove();
                updateCreditsForSemester(semester);
            });

            // Re-bind the dropdown toggle click functionality
            button.off("click").on("click", function () {
                if (!$(this).hasClass("dragging")) {
                    $(this).toggleClass("active");
                    $(this).siblings(".dropdown-content").toggle();
                }
            });

            // Reapply draggable only to the new element (if necessary)
            original.draggable({
                helper: "clone",
                revert: "invalid",
                start: function () {
                    button.addClass("dragging");
                },
                stop: function () {
                    button.removeClass("dragging");
                }
            });

            // Append the cloned element to the semester
            semester.append(original);

            // Update credit totals for the semester
            updateCreditsForSemester(semester);
        }
    });

    // Optional: Handle "X" button to remove course
    $(document).on("click", ".remove-course", function (e) {
        e.stopPropagation();
        //clones button/dropdown
        const classContainer = $(this).closest(".class-container");
        const button = classContainer.find(".course-button");
        const dropdown = classContainer.find(".dropdown-content").clone();
        const semesterDiv = classContainer.closest(".semester");
        //removes X as well as readjusts dropdown/button
        button.find(".remove-course").remove();
        button.toggleClass("active");
        dropdown.toggle();
        // Create class container and add dropdown, adds back to Available Courses
        const newClassContainer = $("<div>").addClass("class-container");
        newClassContainer.append(button).append(dropdown);

        $("#course-buttons").append(newClassContainer);


        // Make draggable again with full behavior
        newClassContainer.draggable({
            helper: "clone",
            revert: "invalid",
            start: function () {
                button.find(".course-button").addClass("dragging");
            },
            stop: function () {
                button.find(".course-button").removeClass("dragging");
            }
        });
        // Remove from semester
        classContainer.remove();
        updateCreditsForSemester(semesterDiv);
        // Re-check all semesters for errors after removal
        $(".semester .class-container").each(function () {
            const container = $(this);
            const button = container.find(".course-button");
            const code = button.data("code");
            const semesterDiv = container.closest(".semester");
            const courseObj = allCourses.find(c => c.code === code);

            if (!prerequisitesMet(courseObj, semesterDiv.attr("id"))) {
                button.css("background-color", "#f44336");
                if (!container.find(".error-msg").length) {
                    container.append(`<div class="error-msg" style="color: red;">Missing prerequisites: ${courseObj.prerequisites.join(", ")}</div>`);
                }
            } else {
                button.css("background-color", "gold");
                container.find(".error-msg").remove();
            }
        });
    });
    $("#validate-btn").on("click", function () {
        const plannedCourses = getPlannedCourses();
        const summary = checkRequirements(plannedCourses);
        displayRequirementSummary(summary);
    });

    let major = "cs"; // Default major (can be changed dynamically)

$("#generate-plan").on("click", function () {
    console.log("Loading plan for major:", major);

    // Get the CSV path based on the selected major
    const csvPath = planPaths[major];
    if (!csvPath) {
        alert("No plan available for the selected major!");
        return;
    }

    // Fetch and parse the CSV directly
    Papa.parse(csvPath, {
        download: true,  // Required to fetch CSV from URL
        header: true,   // Treat first row as headers
        dynamicTyping: true,
        complete: function (results) {
            console.log("Plan loaded successfully:", results.data);
            loadFourYearPlan(results.data);
        },
        error: function (error) {
            console.error("Error loading CSV:", error);
            alert("Failed to load the plan. Check console for details.");
        }
    });
});
});

function loadMajorRequirements(csvUrl) {
    Papa.parse(csvUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            requirements = results.data;
            console.log("CSV loaded from:", csvUrl);
            console.log("Parsed CSV Data:", results.data); 
        },
        error: function (err) {
            console.error("CSV parsing error:", err);
        }
    });
}
function loadFourYearPlan(planArray) {
    // Clear existing courses
    $(".semester").empty();

    // Group by numeric semester ID (1–8)
    const semesterGroups = {};
    planArray.forEach(entry => {
        const semester = parseInt(entry.Semester); // expect 1–8
        if (!semesterGroups[semester]) {
            semesterGroups[semester] = [];
        }
        semesterGroups[semester].push(entry);
    });

    // Add each course to its semester
    for (const semester in semesterGroups) {
        const semesterId = `#semester-${semester}`;
        const semesterDiv = $(semesterId);

        if (semesterDiv.length === 0) {
            console.warn(`Semester div not found: ${semesterId}`);
            continue;
        }

        semesterGroups[semester].forEach(entry => {
            const courseCode = entry.CourseCode.trim();
            if (!courseCode) return;

            // Try to find the course in `allCourses`, or create a minimal version if not found
            let courseData = allCourses.find(c => c.code === courseCode);
            if (!courseData) {
                console.warn(`Course not found: ${courseCode}. Creating a minimal entry.`);
                courseData = {
                    code: courseCode,
                    name: "",  // Default name
                    credits: 3,              // Default credits (adjust as needed)
                    prerequisites: [],       // Empty prerequisites
                    semesterOffered: []      // No semester info
                };
                // Optional: Add the new course to `allCourses` for future reference
                allCourses.push(courseData);
            }

            const button = $(`<div class="course-button" data-code="${courseData.code}" data-credits="${courseData.credits}">`)
                .text(`${courseData.code} - ${courseData.name}`)
                .click(function () {
                    if (!$(this).hasClass("dragging")) {
                        $(this).toggleClass('active');
                        $(this).siblings(".dropdown-content").toggle();
                    }
                });

            const dropdown = $(`<div class="dropdown-content">`).html(`
                <strong>Code:</strong> ${courseData.code} <br>
                <strong>Name:</strong> ${courseData.name} <br>
                <strong>Credits:</strong> ${courseData.credits} <br>
                <strong>Prerequisites:</strong> ${courseData.prerequisites?.join(", ") || "None"} <br>
                <strong>Semester Offered:</strong> ${courseData.semesterOffered?.join(", ") || ""}
            `);

            const classContainer = $("<div>")
                .addClass("class-container")
                .append(button)
                .append(dropdown);

            button.append(` <button class="remove-course">X</button>`)
                .find(".remove-course")
                .on("click", function (e) {
                    e.stopPropagation();
                    
                    let total = 0; 

                    classContainer.remove();
                    
                    semesterDiv.find(".class-container").each(function () {
                        const credits = parseInt($(this).find(".course-button").data("credits"));
                        total += isNaN(credits) ? 0 : credits;
                    });

                    // Update the span that appears BEFORE the semester div
                    const creditSpan = semesterDiv.closest(".semester-block").find(".credit-total");
                    if (creditSpan.length) {
                        creditSpan.text("Credits: " + total);
                    }
                });

            classContainer.draggable({
                helper: "clone",
                revert: "invalid",
                start: function () {
                    button.addClass("dragging");
                },
                stop: function () {
                    button.removeClass("dragging");
                }
            });

            semesterDiv.append(classContainer);

            let total = 0;

            // Sum credits from all class-containers inside this semester
            semesterDiv.find(".class-container").each(function () {
                const credits = parseInt($(this).find(".course-button").data("credits"));
                total += isNaN(credits) ? 0 : credits;
            });

            // Update the span that appears BEFORE the semester div
            const creditSpan = semesterDiv.closest(".semester-block").find(".credit-total");
            if (creditSpan.length) {
                creditSpan.text("Credits: " + total);
            }
        });
    }
}

function getPlannedCourses() {
    let plannedCourses = [];

    $(".semester .course-button").each(function () {
        const code = $(this).data("code");
        const credits = parseInt($(this).data("credits")) || 0;
        plannedCourses.push({ code, credits });
    });

    return plannedCourses;
}

function checkRequirements(plannedCourses) {
    const plannedCodes = plannedCourses.map(c => c.code);
    let summary = [];

    requirements.forEach(req => {
        const possibleCourses = req["Possible Courses"].split(",").map(s => s.trim());
        console.log(`\nChecking requirement: ${req["Requirement Type"]}`);
        console.log("Possible Courses (raw):", req["Possible Courses"]);
        console.log("Split Possible Courses:", possibleCourses);
        console.log("Planned Course Codes:", plannedCodes);
        const matchingCourses = plannedCourses.filter(course =>
            possibleCourses.includes(course.code)
        );

        const creditsEarned = matchingCourses.reduce((acc, c) => acc + c.credits, 0);
        const classesEarned = matchingCourses.length;
        console.log("Matching Courses:", matchingCourses.map(c => c.code));
        const creditsNeeded = parseInt(req["Credits Needed"]);
        const classesNeeded = parseInt(req["Classes Needed"]);

        // Determine if the requirement is fulfilled
        const fulfilled = creditsEarned >= creditsNeeded && classesEarned >= classesNeeded;

        // Set the warning status if the user is close to meeting the requirements
        const warning = creditsEarned >= creditsNeeded - 3; // For example, give warning if within 3 credits

        // If not fulfilled and no warning, it's an error
        const error = !fulfilled && !warning;

        summary.push({
            name: req["Requirement Type"],
            fulfilled,
            warning,
            error,
            creditsNeeded,
            creditsEarned,
            classesNeeded,
            classesEarned,
            remainingCredits: Math.max(0, creditsNeeded - creditsEarned),
            remainingClasses: Math.max(0, classesNeeded - classesEarned),
        });
    });

    return summary;
}

function displayRequirementSummary(requirements) {
    const summaryContainer = document.getElementById('requirement-summary');
    summaryContainer.innerHTML = ''; // Clear existing content

    requirements.forEach((requirement) => {
        const requirementItem = document.createElement('div');
        requirementItem.classList.add('requirement-item');

        const remainingCredits = requirement.remainingCredits;

        if (remainingCredits === 0) {
            requirementItem.classList.add('fulfilled');
            requirementItem.innerHTML = `
                <strong>${requirement.name}:</strong> <span class="status-text">0 credits remaining (Fulfilled)</span>
            `;
        } else if (requirement.warning) {
            requirementItem.classList.add('warning');
            requirementItem.innerHTML = `
                <strong>${requirement.name}:</strong> <span class="status-text">${remainingCredits} credits remaining (Warning)</span>
            `;
        } else {
            requirementItem.classList.add('error');
            requirementItem.innerHTML = `
                <strong>${requirement.name}:</strong> <span class="status-text">${remainingCredits} credits remaining (Unfulfilled)</span>
            `;
        }

        summaryContainer.appendChild(requirementItem);
    });
}


function updateDegreeAndLoadCSV(selectedMajor) {
    const csvPath = csvPaths[selectedMajor];
    const planPath = planPaths[selectedMajor];

    if (!planPath) {
        alert("No plan found.");
        return;
    }

    Papa.parse(planPath, {
        download: true,
        header: true,
        complete: function (results) {
            console.log("Parsed Plan Data:", results.data);
            loadFourYearPlan(results.data);
        },
        error: function (err) {
            console.error("Error parsing plan:", err);
        }
    });

    if (csvPath) {
        loadMajorRequirements(csvPath);
    } else {
        console.error("CSV path not found for degree:", selectedMajor);
    }
    updateAllSemesterCredits();
}
