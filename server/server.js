const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db")
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

connectDB(); // Connect to MongoDb

// Serve static HTML from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Import Routes
const courseRoutes = require("./routes/courses");
app.use("/api/courses", courseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
