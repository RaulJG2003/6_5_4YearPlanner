$(document).ready(() => {
    $.get("/api/courses", (courses) => {
        courses.forEach((course) => {
            $("#course-table").append(`
                <tr>
                    <td>${course.code}</td>
                    <td>${course.name}</td>
                    <td>${course.credits}</td>
                    <td>${course.prerequisites.length > 0 ? course.prerequisites.join(", ") : "None"}</td>
                    <td>${course.semesterOffered.join(", ")}</td>
                </tr>
            `);
        });
    });
});
