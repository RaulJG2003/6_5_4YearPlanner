let allCourses = [];

$.get("/api/courses", function (data) {
    allCourses = data;
    renderCourses(allCourses); // Optionally render all at the start
});

$(document).ready(() => {
    const buttonContainer = $("#course-buttons");

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
    }

    function prerequisitesMet(course, semesterId){
        
        if (!course || !Array.isArray(course.prerequisites)) return true;

        // If no prerequisites or only empty strings, it's considered met
        const filteredPrereqs = course.prerequisites.filter(p => p.trim() !== "");
        if (filteredPrereqs.length === 0) return true;
        
        const currentSemesterIndex = parseInt(semesterId.split('-')[1]);

        // Gather all the courses from semesters before the current one
        let takenCourses = new Set();
        for (let i = 1; i < currentSemesterIndex; i++){
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
            const original = ui.helper.clone();
            const button = original.find(".course-button");
            const code = button.data("code");

            // Prevent duplicates (if needed)
            if ($(this).find(`[data-code='${code}']`).length) return;

            // Add "X" remove button if not already added
            if (!button.find(".remove-course").length) {
                button.append(` <button class="remove-course">X</button>`);
            }

            // Re-bind the dropdown toggle click
            button.off("click").on("click", function (e) {
                if (!$(this).hasClass("dragging")) {
                    $(this).toggleClass("active");
                    $(this).siblings(".dropdown-content").toggle();
                }
            });

            // Re-apply draggable on the dropped container
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
            //deletes it from course offered
            $(`#course-buttons .class-container:has([data-code='${code}'])`).remove();
            // this checks if we are dragging it from our current semester
            const prevSemester = ui.helper.closest(".semester");
            if (prevSemester.length) {
                prevSemester.find(`.class-container:has([data-code='${code}'])`).remove();
            }

            $(".semester").each(function () {
                $(this).find(`[data-code='${code}']`).closest(".class-container").remove();
                updateCreditsForSemester($(this));
            });

            // Check if prerequisites are met
            const courseObj = allCourses.find(c => c.code === code);
            if (!prerequisitesMet(courseObj, semester.attr("id"))) {
                original.find(".course-button").css("background-color", "#f44336"); // red
                if (!original.find(".error-msg").length) {
                    original.append(`<div class="error-msg" style="color: red;">Missing prerequisites: ${courseObj.prerequisites.join(", ")}</div>`);
                }

            }
            
            else {
                original.find(".course-button").css("background-color", "gold");
                original.find(".error-msg").remove();
            }
            
            // Append to semester
            semester.append(original);
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
});

