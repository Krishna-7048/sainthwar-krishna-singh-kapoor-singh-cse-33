// Import File System module
const filesys = require("fs");

// CREATE: Create a new file
filesys.writeFileSync("student.txt", "name:ABES");
console.log("File created successfully");

// READ: Read file contents
const filedata = filesys.readFileSync("student.txt", "Utf8");
console.log(filedata);

// UPDATE: Update file contents
const u = filesys.writeFileSync("student.txt", "name:Krishna");
console.log("File updated successfully");

// READ: Display updated contents
const newfiledata = filesys.readFileSync("student.txt", "Utf8");
console.log(newfiledata);
