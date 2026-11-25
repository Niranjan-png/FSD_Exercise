const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: String,
    age: Number,
    branch: String,
    email: String
});

module.exports = mongoose.model("Student", studentSchema);