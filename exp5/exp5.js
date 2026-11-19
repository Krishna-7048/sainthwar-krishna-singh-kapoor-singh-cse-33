// EXPERIMENT 5: Create Routes to Handle GET, POST, PUT and DELETE in Node.js

// 1. Import Express Module
const express = require("express");

// 2. Create Express Application
const app = express();

// 3. Middleware to Parse JSON Data
app.use(express.json());

// 4. Create Student Array
let students = [
  { id: 1, name: "Krishna", age: 21 },
  { id: 2, name: "Krishna", age: 20 }
];

// 5. GET Method - Display All Students
app.get("/students", (req, res) => {
  res.send(students);
});

// 6. POST Method - Add a New Student
app.post("/students", (req, res) => {
  const student = req.body;
  students.push(student);
  res.send("Student added successfully");
});

// 7. PUT Method - Update Student Details
app.put("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const student = students.find(s => s.id === id);
  if (student) {
    student.name = req.body.name;
    student.age = req.body.age;
    res.send("Student updated successfully");
  } else {
    res.send("Student not found");
  }
});

// 8. DELETE Method - Delete a Student
app.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  students = students.filter(s => s.id !== id);
  res.send("Student deleted successfully");
});

// 9. Start the Server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
