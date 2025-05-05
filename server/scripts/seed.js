const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Course = require("../models/Course");
const csvtojson = require("csvtojson"); 

//var seedCourses = []; // our json

//populates a json 
function popJSON() {
  const fileName = "classes.csv"; 
  return csvtojson().fromFile(fileName).then((source) => {
    const parsed = source.map(row => ({
      code: row["Class"],
      name: row["Name"] || undefined,
      prerequisites: row["PreReq"] ? row["PreReq"].split(',') : [],
      credits: row["Credits"] ? Number(row["Credits"]) : undefined,
      attributes: row["Attributes"] || undefined,
      semesterOffered: row["Semester Offerd"]
        ? row["Semester Offerd"].split(',').map(s => s.trim())
        : [],
    }));
    console.log("CSV translated!");
    return parsed;
  });
}
//keeping just in case
//const seedCourses = [
  //{ code: "CMSC 201", name: "Computer Science I", credits: 4, prerequisites: [], semesterOffered: ["Fall", "Spring"] },
  //{ code: "CMSC 202", name: "Computer Science II", credits: 4, prerequisites: ["CMSC 201"], semesterOffered: ["Spring", "Fall"] },
  //{ code: "CMSC 341", name: "Data Structures", credits: 3, prerequisites: ["CMSC 202"], semesterOffered: ["Fall", "Spring"] },
  //{ code: "CMSC 313", name: "Assembly", credits: 3, prerequisites: ["CMSC 202"], semesterOffered: ["Fall", "Spring"] },
//];

const seedDB = async () => {
  await connectDB();
  const seedCourses = await popJSON(); // ✅ Wait for CSV parsing
  await Course.deleteMany({});
  await Course.insertMany(seedCourses);
  console.log("Database Seeded! ✅");
  process.exit();
};

seedDB();
