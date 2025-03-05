const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://rbhatt4:teamfiverocks@studentdata.xjdyl.mongodb.net/?retryWrites=true&w=majority&appName=StudentData");
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
