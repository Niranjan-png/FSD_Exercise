
const express = require("express");
const mongoose = require("mongoose");
const Student = require("./models/Student");

const app = express();

app.use(express.json());

// MongoDB Atlas connection
const MONGO_URI = "mongodb+srv://niranjanballal2006_db_user:PJNfvgABClxBMNTN@YOUR_CLUSTER.mongodb.net/studentsDB?retryWrites=true&w=majority";

// 1. CREATE - Add a new student
app.post("/students", async (req, res) => {
    try {
        const student = await Student.create(req.body);

        res.status(201).json({
            message: "Student added successfully",
            student: student
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// 2. READ - Get all students
app.get("/students", async (req, res) => {
    try {
        const students = await Student.find();

        res.status(200).json(students);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// 3. READ - Get a student by ID
app.get("/students/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json(student);

    } catch (error) {
        res.status(400).json({
            message: "Invalid student ID"
        });
    }
});

// 4. UPDATE - Update student details
app.put("/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student updated successfully",
            student: student
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// 5. DELETE - Delete a student
app.delete("/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student deleted successfully"
        });

    } catch (error) {
        res.status(400).json({
            message: "Invalid student ID"
        });
    }
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");

        app.listen(3000, () => {
            console.log("Server running on port 3000");
        });
    })
    .catch((error) => {
        console.error("MongoDB Connection Failed:", error.message);
    });
