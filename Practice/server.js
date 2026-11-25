require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const Student = require("./models/student");

const app = express();

app.use(express.json());

connectDB();

app.get("/", (req, res) => {
    res.send("Server is running");

});

app.get("/students", async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json({
            message: "Students retrieved are : ",
            data: students
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }

});

app.post("/add-student", async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json({
            message: "Student has added successfully!",
            data: student
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }

});
app.listen(process.env.PORT, () => {
    console.log(`server running`)
});