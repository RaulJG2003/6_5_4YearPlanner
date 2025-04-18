$(document).ready(() => {
    $.get("/api/courses", (courses) => {
        const buttonContainer = $("#course-buttons");

        courses.forEach((course, index) => {
            // --- Create draggable button with dropdown ---
            const button = $(`<div class="course-button" data-code="${course.code}" data-credits="${course.credits}">`)
                .text(`${course.code} - ${course.name}`)
                .click(function (e) {
                    // Prevent drag from triggering click
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

            // Make the whole classContainer draggable
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
    });

    function updateCreditsForSemester(semesterDiv) {
        let total = 0;
    
        // Sum credits from all class-containers inside this semester
        semesterDiv.find(".class-container").each(function () {
            const credits = parseInt($(this).find(".course-button").data("credits"));
            total += isNaN(credits) ? 0 : credits;
        });
    
        // Update the span that appears BEFORE the semester div
        const creditSpan = semesterDiv.prev(".credit-total");
        if (creditSpan.length) {
            creditSpan.text("Credits: " + total);
        }
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
            // Append to semester
            $(this).append(original);
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
    });
});

