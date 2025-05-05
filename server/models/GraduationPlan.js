const mongoose = require("mongoose");

const graduationPlanSchema = new mongoose.Schema({
    requirementType: { type: String, required: true },
    creditsNeeded: { type: Number, required: true },
    classesNeeded: { type: Number, required: true },
    possibleCourses: { type: [String], required: true }, // Array of course codes
    attributes: { type: String, default: "" }, // Default to an empty string if not provided
  })

module.exports = mongoose.model("GraduationPlan", graduationPlanSchema);