const express = require('express');
const app = express();

// Middleware to accept JSON body in requests
app.use(express.json());

// In-Memory Array of Leave Requests (Initial Data from question)
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

// Variable to generate next unique ID (starts at 704)
let nextId = 704;

// Simple home route to check if server is running
app.get('/', (req, res) => {
  res.status(200).json({ message: "Employee Leave Management API is running" });
});

// =========================================================================
// NOTE: We put '/pending' and '/filter' BEFORE '/:id' so Express does not
// confuse 'pending' or 'filter' as an ID.
// =========================================================================

// 7. GET pending leave requests (GET /api/leaves/pending)
app.get('/api/leaves/pending', (req, res) => {
  const pendingLeaves = leaves.filter(l => l.status.toLowerCase() === 'pending');
  res.status(200).json(pendingLeaves);
});

// 6. Filter records by status (GET /api/leaves/filter?status=value)
app.get('/api/leaves/filter', (req, res) => {
  const status = req.query.status;

  // Check if status is provided in the URL
  if (!status) {
    return res.status(400).json({ message: "status query parameter is required" });
  }

  // Filter case-insensitively
  const filtered = leaves.filter(l => l.status.toLowerCase() === status.toLowerCase());
  res.status(200).json(filtered);
});

// 1. GET all records (GET /api/leaves)
app.get('/api/leaves', (req, res) => {
  res.status(200).json(leaves);
});

// 3. GET leave request by ID (GET /api/leaves/:id)
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

// 2. POST a new record (POST /api/leaves)
app.post('/api/leaves', (req, res) => {
  const { employeeName, employeeCode, leaveType, days, status } = req.body;

  // 1. Check all required fields are present and not empty
  if (!employeeName || !employeeCode || !leaveType || days === undefined || !status) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // 2. Check days: must be a positive integer (> 0)
  if (typeof days !== 'number' || !Number.isInteger(days) || days <= 0) {
    return res.status(400).json({ message: "days must be a positive integer" });
  }

  // 3. Check leaveType: Casual, Sick, or Earned
  const validLeaveTypes = ["Casual", "Sick", "Earned"];
  if (!validLeaveTypes.includes(leaveType)) {
    return res.status(400).json({ message: "leaveType must be Casual, Sick, or Earned" });
  }

  // 4. Check status: Pending, Approved, or Rejected
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

// 4. PUT / update a record (PUT /api/leaves/:id)
app.put('/api/leaves/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  const leave = leaves.find(l => l.id === id);

  // Return 404 if not found
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

  // Update the values in the existing record
  leave.employeeName = employeeName;
  leave.employeeCode = employeeCode;
  leave.leaveType = leaveType;
  leave.days = days;
  leave.status = status;

  res.status(200).json(leave);
});

// 5. DELETE a record (DELETE /api/leaves/:id)
app.delete('/api/leaves/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  const index = leaves.findIndex(l => l.id === id);

  // Return 404 if not found
  if (index === -1) {
    return res.status(404).json({ message: "Leave request not found" });
  }

  // Remove from array and return 200 with success message
  const deleted = leaves.splice(index, 1)[0];
  res.status(200).json({
    message: "Leave request deleted successfully",
    deletedRecord: deleted
  });
});

// Start the server on port 5000 if run directly
if (require.main === module) {
  app.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
  });
}

module.exports = app;
