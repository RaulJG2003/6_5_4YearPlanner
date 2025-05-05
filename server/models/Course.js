const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  code: { type: String, default: "" }, // Default to empty string
  name: { type: String, default: "" },               // Default to empty string
  credits: { type: Number, default: 3 },             // Default to 0 credits
  prerequisites: { type: [String], default: [] },                    // Default to empty array
  semesterOffered: { type: [String], default: [] }                   // Default to empty array
});

module.exports = mongoose.model("Course", CourseSchema);