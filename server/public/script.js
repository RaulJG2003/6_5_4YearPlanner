$(document).ready(() => {
    // Fetch courses from API and populate the available courses list
    $.get("/api/courses", (courses) => {
        courses.forEach((course) => {
            $("#courses").append(`
                <li class="course" data-code="${course.code}">
                    ${course.code} - ${course.name} (${course.credits} Credits)
                </li>
            `);
        });

        // Make courses draggable
        $(".course").draggable({
            helper: "clone",
            revert: "invalid"
        });
    });

    // Make semesters droppable
    $(".semester").droppable({
        accept: ".course",
        drop: function(event, ui) {
            let courseCode = ui.helper.data("code"); // Get course code
            let courseName = ui.helper.clone().children().remove().end().text().trim(); // Clean name
            
            // Remove the original course from Available Courses
            $(`.course[data-code='${courseCode}']`).remove();

            // Check if remove button already exists (prevents duplication)
            let courseItem = ui.helper.clone();
            if (!courseItem.find(".remove-course").length) {
                courseItem.append(` <button class="remove-course">X</button>`);
            }

            // Append to semester and make draggable
            $(this).append(courseItem);
            courseItem.draggable({ revert: "invalid" });
        }
    });

    // Handle clicking "Remove" button to send course back to Available Courses
    $(document).on("click", ".remove-course", function() {
        let courseItem = $(this).parent(); // Get the course item
        let courseCode = courseItem.data("code"); // Get course code
        let courseName = courseItem.clone().children().remove().end().text().trim(); // Remove "X"

        // Remove course from semester
        courseItem.remove();

        // Add back to Available Courses
        $("#courses").append(`
            <li class="course" data-code="${courseCode}">
                ${courseName}
            </li>
        `);

        // Make it draggable again
        $(".course").draggable({
            helper: "clone",
            revert: "invalid"
        });
    });
});
