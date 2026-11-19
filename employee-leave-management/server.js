const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Middleware (Assessment Component 1: 2 Marks)
// ==========================================
app.use(cors());
app.use(express.json());

// Request logger middleware for debugging/demonstration
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// In-Memory Data Store (Initial Data)
// ==========================================
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

// Valid allowed values for enum fields
const VALID_LEAVE_TYPES = ['Casual', 'Sick', 'Earned'];
const VALID_STATUSES = ['Pending', 'Approved', 'Rejected'];

// Helper function to validate leave request payload
function validateLeavePayload(data, isUpdate = false) {
  const errors = [];
  const { employeeName, employeeCode, leaveType, days, status } = data;

  // employeeName validation
  if (!isUpdate || employeeName !== undefined) {
    if (!employeeName || typeof employeeName !== 'string' || employeeName.trim() === '') {
      errors.push("employeeName is required and must be a non-empty string.");
    }
  }

  // employeeCode validation
  if (!isUpdate || employeeCode !== undefined) {
    if (!employeeCode || typeof employeeCode !== 'string' || employeeCode.trim() === '') {
      errors.push("employeeCode is required and must be a non-empty string.");
    }
  }

  // leaveType validation: Casual, Sick, or Earned
  if (!isUpdate || leaveType !== undefined) {
    if (!leaveType || !VALID_LEAVE_TYPES.includes(leaveType)) {
      errors.push(`leaveType must be one of: ${VALID_LEAVE_TYPES.join(', ')}.`);
    }
  }

  // days validation: positive integer (> 0)
  if (!isUpdate || days !== undefined) {
    if (days === undefined || days === null || typeof days !== 'number' || !Number.isInteger(days) || days <= 0) {
      errors.push("days is required and must be a positive integer greater than 0.");
    }
  }

  // status validation: Pending, Approved, or Rejected
  if (!isUpdate || status !== undefined) {
    if (!status || !VALID_STATUSES.includes(status)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}.`);
    }
  }

  return errors;
}

// Helper to generate a unique numeric ID
function generateUniqueId() {
  if (leaves.length === 0) return 701;
  return Math.max(...leaves.map(l => l.id)) + 1;
}

// ==========================================
// Root / Health Check Endpoint
// ==========================================
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Employee Leave Management REST API is running",
    endpoints: {
      "GET all records": "GET /api/leaves",
      "POST a new record": "POST /api/leaves",
      "GET pending leave requests": "GET /api/leaves/pending",
      "Filter records by status": "GET /api/leaves/filter?status=value",
      "GET leave request by ID": "GET /api/leaves/:id",
      "PUT / update record by ID": "PUT /api/leaves/:id",
      "DELETE record by ID": "DELETE /api/leaves/:id"
    }
  });
});

// ==========================================
// IMPORTANT IMPLEMENTATION NOTE:
// Specific routes (/pending and /filter) are declared
// BEFORE dynamic parameterized routes (/:id) to prevent
// 'pending' or 'filter' from being treated as an ID.
// ==========================================

// ==========================================
// 7. GET Pending Leave Requests (2 Marks)
// Route: GET /api/leaves/pending
// ==========================================
app.get('/api/leaves/pending', (req, res) => {
  const pendingLeaves = leaves.filter(leave => leave.status.toLowerCase() === 'pending');
  return res.status(200).json(pendingLeaves);
});

// ==========================================
// 6. Filter Records by Status (3 Marks)
// Route: GET /api/leaves/filter?status=value
// Case-insensitive filtering. Returns [] with HTTP 200 if no match.
// ==========================================
app.get('/api/leaves/filter', (req, res) => {
  const { status } = req.query;

  if (!status || typeof status !== 'string' || status.trim() === '') {
    return res.status(400).json({
      error: "Query parameter 'status' is required. Example: /api/leaves/filter?status=Pending"
    });
  }

  const searchStatus = status.trim().toLowerCase();
  const filteredLeaves = leaves.filter(
    leave => leave.status.toLowerCase() === searchStatus
  );

  return res.status(200).json(filteredLeaves);
});

// ==========================================
// 1. GET All Records (2 Marks)
// Route: GET /api/leaves
// Return all records in JSON format with HTTP 200.
// ==========================================
app.get('/api/leaves', (req, res) => {
  return res.status(200).json(leaves);
});

// ==========================================
// 2. POST a New Record with Validation (4 Marks)
// Route: POST /api/leaves
// Validates fields, generates unique numeric id, returns created record with HTTP 201.
// Invalid input returns HTTP 400.
// ==========================================
app.post('/api/leaves', (req, res) => {
  const { employeeName, employeeCode, leaveType, days, status } = req.body;

  const errors = validateLeavePayload(req.body, false);
  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors
    });
  }

  const newRecord = {
    id: generateUniqueId(),
    employeeName: employeeName.trim(),
    employeeCode: employeeCode.trim(),
    leaveType,
    days,
    status
  };

  leaves.push(newRecord);
  return res.status(201).json(newRecord);
});

// ==========================================
// 3. GET Leave Request by ID (2 Marks)
// Route: GET /api/leaves/:id
// Return matching record with HTTP 200. If ID does not exist, return HTTP 404.
// ==========================================
app.get('/api/leaves/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      error: "Invalid ID parameter. ID must be a numeric integer."
    });
  }

  const record = leaves.find(leave => leave.id === id);

  if (!record) {
    return res.status(404).json({
      error: `Leave request with ID ${id} not found.`
    });
  }

  return res.status(200).json(record);
});

// ==========================================
// 4. PUT / Update a Record (3 Marks)
// Route: PUT /api/leaves/:id
// Update requested record using JSON body. Return updated record with HTTP 200.
// If not found, return HTTP 404. Invalid input returns HTTP 400.
// ==========================================
app.put('/api/leaves/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      error: "Invalid ID parameter. ID must be a numeric integer."
    });
  }

  const index = leaves.findIndex(leave => leave.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: `Leave request with ID ${id} not found.`
    });
  }

  // Validate the incoming update data
  const errors = validateLeavePayload(req.body, false);
  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors
    });
  }

  const { employeeName, employeeCode, leaveType, days, status } = req.body;

  // Update existing record while preserving the unique numeric ID
  leaves[index] = {
    id,
    employeeName: employeeName.trim(),
    employeeCode: employeeCode.trim(),
    leaveType,
    days,
    status
  };

  return res.status(200).json(leaves[index]);
});

// ==========================================
// 5. DELETE a Record (2 Marks)
// Route: DELETE /api/leaves/:id
// Delete requested record and return suitable success message with HTTP 200.
// If not found, return HTTP 404.
// ==========================================
app.delete('/api/leaves/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      error: "Invalid ID parameter. ID must be a numeric integer."
    });
  }

  const index = leaves.findIndex(leave => leave.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: `Leave request with ID ${id} not found.`
    });
  }

  const deletedRecord = leaves.splice(index, 1)[0];

  return res.status(200).json({
    message: `Leave request with ID ${id} deleted successfully.`,
    deletedRecord
  });
});

// Handle undefined routes with 404
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found.`
  });
});

// Start the server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Employee Leave Management API server running on port ${PORT}`);
    console.log(`Access Base URL: http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
