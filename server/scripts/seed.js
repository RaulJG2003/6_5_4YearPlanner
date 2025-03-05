const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Course = require("../models/Course");

const seedCourses = [
  { code: "CMSC 201", name: "Computer Science I", credits: 4, prerequisites: [], semesterOffered: ["Fall", "Spring"] },
  { code: "CMSC 202", name: "Computer Science II", credits: 4, prerequisites: ["CMSC 201"], semesterOffered: ["Spring", "Fall"] },
  { code: "CMSC 341", name: "Data Structures", credits: 3, prerequisites: ["CMSC 202"], semesterOffered: ["Fall", "Spring"] },
];

const seedDB = async () => {
  await connectDB();
  await Course.deleteMany({});
  await Course.insertMany(seedCourses);
  console.log("Database Seeded! ✅");
  process.exit();
};

seedDB();
