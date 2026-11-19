const express = require('express');
const app = express();

// Middleware: allows express to understand JSON bodies sent in POST and PUT requests
app.use(express.json());

// In-Memory JavaScript Array storing leave records
let leaves = [
  {
    id: 701,
    employeeName: "Ananya Singh",
    employeeCode: "EMP101",
    leaveType: "Casual",
    days: 2,
    status: "Pending"
  },
  {
    id: 702,
    employeeName: "Rahul Verma",
    employeeCode: "EMP102",
    leaveType: "Sick",
    days: 1,
    status: "Approved"
  },
  {
    id: 703,
    employeeName: "Simran Kaur",
    employeeCode: "EMP103",
    leaveType: "Earned",
    days: 3,
    status: "Rejected"
  }
];

// Counter for auto-generating unique numeric IDs (next one is 704)
let nextId = 704;

// Root test route
app.get('/', (req, res) => {
  res.status(200).send("Employee Leave Management API is running! Access /api/leaves");
});

// =========================================================================
// NOTE: /pending and /filter MUST be placed BEFORE /:id
// Otherwise, Express will mistakenly treat 'pending' as an ':id' parameter!
// =========================================================================

// 7. GET pending leave requests
// Test URL: http://localhost:5000/api/leaves/pending
app.get('/api/leaves/pending', (req, res) => {
  const pendingLeaves = leaves.filter(l => l.status.toLowerCase() === 'pending');
  res.status(200).json(pendingLeaves);
});

// 6. Filter leave requests by status (case-insensitive)
// Test URL: http://localhost:5000/api/leaves/filter?status=Pending
app.get('/api/leaves/filter', (req, res) => {
  const status = req.query.status;

  if (!status) {
    return res.status(400).json({ message: "status query parameter is required" });
  }

  // Case-insensitive filtering
  const filtered = leaves.filter(l => l.status.toLowerCase() === status.toLowerCase());
  res.status(200).json(filtered);
});

// 1. GET all records
// Test URL: http://localhost:5000/api/leaves
app.get('/api/leaves', (req, res) => {
  res.status(200).json(leaves);
});

// 3. GET leave request by ID
// Test URL: http://localhost:5000/api/leaves/701
app.get('/api/leaves/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  const leave = leaves.find(l => l.id === id);

  if (!leave) {
    return res.status(404).json({ message: "Leave request not found" });
  }

  res.status(200).json(leave);
});

// 2. POST a new leave request
// URL: POST http://localhost:5000/api/leaves
app.post('/api/leaves', (req, res) => {
  const { employeeName, employeeCode, leaveType, days, status } = req.body;

  // 1. Check all required fields are present
  if (!employeeName || !employeeCode || !leaveType || days === undefined || !status) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // 2. Validate days: positive integer (> 0)
  if (typeof days !== 'number' || !Number.isInteger(days) || days <= 0) {
    return res.status(400).json({ message: "days must be a positive integer" });
  }

  // 3. Validate leaveType: Casual, Sick, or Earned
  const validLeaveTypes = ["Casual", "Sick", "Earned"];
  if (!validLeaveTypes.includes(leaveType)) {
    return res.status(400).json({ message: "leaveType must be Casual, Sick, or Earned" });
  }

  // 4. Validate status: Pending, Approved, or Rejected
  const validStatuses = ["Pending", "Approved", "Rejected"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "status must be Pending, Approved, or Rejected" });
  }

  // Create new record with unique numeric ID
  const newLeave = {
    id: nextId++,
    employeeName,
    employeeCode,
    leaveType,
    days,
    status
  };

  leaves.push(newLeave);
  res.status(201).json(newLeave);
});

// 4. PUT / update a record
// URL: PUT http://localhost:5000/api/leaves/701
app.put('/api/leaves/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  const leave = leaves.find(l => l.id === id);

  if (!leave) {
    return res.status(404).json({ message: "Leave request not found" });
  }

  const { employeeName, employeeCode, leaveType, days, status } = req.body;

  // Validation
  if (!employeeName || !employeeCode || !leaveType || days === undefined || !status) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (typeof days !== 'number' || !Number.isInteger(days) || days <= 0) {
    return res.status(400).json({ message: "days must be a positive integer" });
  }

  const validLeaveTypes = ["Casual", "Sick", "Earned"];
  if (!validLeaveTypes.includes(leaveType)) {
    return res.status(400).json({ message: "leaveType must be Casual, Sick, or Earned" });
  }

  const validStatuses = ["Pending", "Approved", "Rejected"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "status must be Pending, Approved, or Rejected" });
  }

  // Update existing record fields
  leave.employeeName = employeeName;
  leave.employeeCode = employeeCode;
  leave.leaveType = leaveType;
  leave.days = days;
  leave.status = status;

  res.status(200).json(leave);
});

// 5. DELETE a record
// URL: DELETE http://localhost:5000/api/leaves/702
app.delete('/api/leaves/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  const index = leaves.findIndex(l => l.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Leave request not found" });
  }

  const deletedRecord = leaves.splice(index, 1)[0];
  res.status(200).json({
    message: "Leave request deleted successfully",
    deletedRecord
  });
});

// Start the server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started! Running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/api/leaves in your browser or Postman`);
});
