const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Course = require("../models/Course");
const csvtojson = require("csvtojson");

// Helper function to clean and validate course data
function cleanCourseData(row) {
  // Clean prerequisites
  const prerequisites = row["PreReq"] 
    ? row["PreReq"].split(',').map(p => p.trim()).filter(p => p)
    : [];

  // Validate and parse credits (default to 3 if invalid)
  let credits = 3;
  if (row["Credits"]) {
    const parsed = parseInt(row["Credits"]);
    credits = isNaN(parsed) ? 3 : Math.max(1, Math.min(4, parsed)); // Clamp between 1-4
  }

  // Clean semester offered
  const semesterOffered = row["Semester Offered"] 
    ? row["Semester Offered"].split(',').map(s => s.trim()).filter(s => s)
    : ["Fall", "Spring"]; // Default to both semesters

  return {
    code: row["Class"].trim(),
    name: row["Name"] ? row["Name"].trim() : row["Class"].trim(),
    prerequisites,
    credits,
    attributes: row["Attributes"] ? row["Attributes"].split(',').map(a => a.trim()) : [],
    semesterOffered: semesterOffered.map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
  };
}

async function loadCoursesFromCSV() {
  const fileName = "classes.csv";
  try {
    const source = await csvtojson().fromFile(fileName);
    
    // Use a Map to automatically handle duplicates (last one wins)
    const coursesMap = new Map();
    source.forEach(row => {
      const course = cleanCourseData(row);
      coursesMap.set(course.code, course); // This overwrites duplicates
    });
    
    return Array.from(coursesMap.values());
  } catch (err) {
    console.error("Error loading CSV file:", err);
    throw err;
  }
}

const seedDB = async () => {
  try {
    await connectDB();
    
    console.log("Loading courses from CSV...");
    const seedCourses = await loadCoursesFromCSV();
    
    console.log(`Found ${seedCourses.length} unique courses`);
    
    console.log(`Deleting existing courses...`);
    await Course.deleteMany({});
    
    console.log(`Inserting ${seedCourses.length} courses...`);
    const result = await Course.insertMany(seedCourses, { ordered: false });
    
    console.log(`Successfully inserted ${result.length} courses`);
    console.log("Database seeded successfully! ✅");
  } catch (err) {
    if (err.name === 'MongoBulkWriteError' && err.code === 11000) {
      console.error("Duplicate courses found in CSV. Please ensure each course code is unique.");
      console.error("Duplicate key:", err.writeErrors[0].err.op.code);
    } else {
      console.error("Database seeding failed:", err);
    }
    process.exit(1);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedDB();