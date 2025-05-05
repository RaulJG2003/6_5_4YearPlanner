const mongoose = require("mongoose");
const connectDB = require("../config/db");
const GraduationPlan = require("../models/GraduationPlan.js");
const csvtojson = require("csvtojson");

var seedGraduationPlan = []; // our json for graduation plan

// Function to populate graduation plan data from CSV
function popGraduationPlanJSON() {
    const fileName = "compsci.csv"; // CSV file for graduation plan
    csvtojson()
      .fromFile(fileName)
      .then((source) => {
        // Goes through the source and converts to JSON format
        for (var i = 0; i < source.length; i++) {
          var oneRow = {
            requirementType: source[i]["Requirement Type"] || "",
            creditsNeeded: parseInt(source[i]["Credits Needed"]) || "",
            classesNeeded: parseInt(source[i]["Classes Needed"]) || "",
            possibleCourses: source[i]["Possible Courses"].split(",").map(course => course.trim()) || "", // Split and clean course names
            attributes: source[i]["Attributes"] || "", // Set to empty string if missing
          };
          seedGraduationPlan.push(oneRow);
        }
        console.log("Graduation Plan CSV translated!");
      });
  }

// Function to seed the database with the graduation plan data
const seedGraduationPlanDB = async () => {
  popGraduationPlanJSON();
  await connectDB();
  await GraduationPlan.deleteMany({}); // Clear any existing data
  await GraduationPlan.insertMany(seedGraduationPlan); // Insert the new data
  console.log("Graduation Plan Database Seeded! ✅");
  process.exit();
};

seedGraduationPlanDB();