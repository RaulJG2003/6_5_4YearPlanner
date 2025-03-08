const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Course = require("../models/Course");
const csvtojson = require("csvtojson"); 

var seedCourses = []; // our json

//populates a json 
function popJSON()
{
  const fileName = "classes.csv"; 
  csvtojson().fromFile(fileName).then((source) =>
  {
    //goes through the source which has been populated from the csv converts to rows to put in seedCourses
    for(var i = 0; i <source.length;i ++)
    {
      //the format for the JSON
      var oneRow ={
        code: source[i]["Class"],
        name: source[i]["Name"],
        prerequisites: source[i]["PreReq"],
        credits: source[i]["Credits"],
        attributes: source[i]["Attributes"],
        semesterOffered:source[i]["Semester Offerd"],
      }
      seedCourses.push(oneRow);
    }
    console.log("CSV translated!");
  })

}
//const seedCourses = [
  //{ code: "CMSC 201", name: "Computer Science I", credits: 4, prerequisites: [], semesterOffered: ["Fall", "Spring"] },
  //{ code: "CMSC 202", name: "Computer Science II", credits: 4, prerequisites: ["CMSC 201"], semesterOffered: ["Spring", "Fall"] },
  //{ code: "CMSC 341", name: "Data Structures", credits: 3, prerequisites: ["CMSC 202"], semesterOffered: ["Fall", "Spring"] },
  //{ code: "CMSC 313", name: "Assembly", credits: 3, prerequisites: ["CMSC 202"], semesterOffered: ["Fall", "Spring"] },
//];

const seedDB = async () => {
  popJSON();
  await connectDB();
  await Course.deleteMany({});
  await Course.insertMany(seedCourses);
  console.log("Database Seeded! ✅");
  process.exit();
};

seedDB();
