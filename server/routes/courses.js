const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get prerequisites for a course
router.get("/:courseCode/prerequisites", async (req, res) => {
  try {
    const course = await Course.findOne({ code: req.params.courseCode });
    res.json(course ? course.prerequisites : []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
