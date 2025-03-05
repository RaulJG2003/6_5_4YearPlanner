const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // Course Code (e.g., "CMSC 201")
  name: { type: String, required: true },              // Course Name
  credits: { type: Number, required: true },           // Credit Hours
  prerequisites: { type: [String], default: [] },      // Array of prerequisite course codes
  semesterOffered: { type: [String], default: [] }     // Semesters offered (e.g., ["Fall", "Spring"])
});

module.exports = mongoose.model("Course", CourseSchema);
