const app = require('./server');

const PORT = 5055; // Use a dedicated test port
let server;
const BASE_URL = `http://localhost:${PORT}`;

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${testName} - ${details}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("   AUTOMATED TEST SUITE: EMPLOYEE LEAVE MANAGEMENT API  ");
  console.log("=======================================================\n");

  server = app.listen(PORT, async () => {
    try {
      // -----------------------------------------------------------
      // TEST 1: GET / (Root Health Check)
      // -----------------------------------------------------------
      console.log("--- Test Group 1: Server Setup & Root Endpoint ---");
      const rootRes = await fetch(`${BASE_URL}/`);
      const rootData = await rootRes.json();
      assert(rootRes.status === 200, "GET / returns HTTP 200");
      assert(rootData.message.includes("Employee Leave Management"), "GET / returns API message");

      // -----------------------------------------------------------
      // TEST 2: GET /api/leaves (Get all initial records)
      // -----------------------------------------------------------
      console.log("\n--- Test Group 2: GET All Records (GET /api/leaves) ---");
      const getAllRes = await fetch(`${BASE_URL}/api/leaves`);
      const allLeaves = await getAllRes.json();
      assert(getAllRes.status === 200, "GET /api/leaves returns HTTP 200");
      assert(Array.isArray(allLeaves), "GET /api/leaves returns an array");
      assert(allLeaves.length === 3, "Initial data contains 3 records (701, 702, 703)", `Got length: ${allLeaves.length}`);
      assert(allLeaves[0].id === 701 && allLeaves[0].employeeName === "Ananya Singh", "First record is Ananya Singh (id: 701)");
      assert(allLeaves[1].id === 702 && allLeaves[1].employeeName === "Rahul Verma", "Second record is Rahul Verma (id: 702)");
      assert(allLeaves[2].id === 703 && allLeaves[2].employeeName === "Simran Kaur", "Third record is Simran Kaur (id: 703)");

      // -----------------------------------------------------------
      // TEST 3: POST /api/leaves (Create a new record with validation)
      // -----------------------------------------------------------
      console.log("\n--- Test Group 3: POST A New Record & Validations (POST /api/leaves) ---");
      const validPayload = {
        employeeName: "Vikram Das",
        employeeCode: "EMP104",
        leaveType: "Earned",
        days: 2,
        status: "Pending"
      };

      const postRes = await fetch(`${BASE_URL}/api/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPayload)
      });
      const createdRecord = await postRes.json();

      assert(postRes.status === 201, "POST /api/leaves returns HTTP 201 on valid input");
      assert(typeof createdRecord.id === "number", "Generated ID is a Number");
      assert(createdRecord.id === 704, "Generated ID is 704 (unique max+1)", `Got id: ${createdRecord.id}`);
      assert(createdRecord.employeeName === "Vikram Das", "employeeName matches created record");

      // Validation 3A: Invalid leaveType
      const invalidTypeRes = await fetch(`${BASE_URL}/api/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validPayload, leaveType: "Holiday" })
      });
      assert(invalidTypeRes.status === 400, "POST with invalid leaveType returns HTTP 400");

      // Validation 3B: Non-positive days (0, negative, non-integer)
      const invalidDaysRes = await fetch(`${BASE_URL}/api/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validPayload, days: -3 })
      });
      assert(invalidDaysRes.status === 400, "POST with negative days returns HTTP 400");

      const floatDaysRes = await fetch(`${BASE_URL}/api/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validPayload, days: 2.5 })
      });
      assert(floatDaysRes.status === 400, "POST with fractional days (2.5) returns HTTP 400");

      // Validation 3C: Invalid status
      const invalidStatusRes = await fetch(`${BASE_URL}/api/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validPayload, status: "Submitted" })
      });
      assert(invalidStatusRes.status === 400, "POST with invalid status returns HTTP 400");

      // Validation 3D: Missing employeeName or empty
      const missingNameRes = await fetch(`${BASE_URL}/api/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validPayload, employeeName: "" })
      });
      assert(missingNameRes.status === 400, "POST with empty employeeName returns HTTP 400");

      // -----------------------------------------------------------
      // TEST 4: Specific routes order check (pending & filter before :id)
      // -----------------------------------------------------------
      console.log("\n--- Test Group 4: Specific Routes (/pending & /filter) ---");
      // GET /api/leaves/pending
      const pendingRes = await fetch(`${BASE_URL}/api/leaves/pending`);
      const pendingLeaves = await pendingRes.json();
      assert(pendingRes.status === 200, "GET /api/leaves/pending returns HTTP 200");
      assert(Array.isArray(pendingLeaves), "GET /api/leaves/pending returns array");
      const allPending = pendingLeaves.every(l => l.status.toLowerCase() === 'pending');
      assert(allPending, "All returned records in /pending have status 'Pending'");

      // GET /api/leaves/filter?status=value (case-insensitive)
      const filterRes = await fetch(`${BASE_URL}/api/leaves/filter?status=approved`);
      const filteredLeaves = await filterRes.json();
      assert(filterRes.status === 200, "GET /api/leaves/filter?status=approved returns HTTP 200");
      assert(filteredLeaves.length >= 1, "Filter returns matching records for 'approved'");
      assert(filteredLeaves.every(l => l.status.toLowerCase() === 'approved'), "Filter matches case-insensitively");

      // GET /api/leaves/filter with uppercase status
      const filterUpperRes = await fetch(`${BASE_URL}/api/leaves/filter?status=REJECTED`);
      const filteredUpperLeaves = await filterUpperRes.json();
      assert(filterUpperRes.status === 200, "GET /api/leaves/filter?status=REJECTED returns HTTP 200");
      assert(filteredUpperLeaves.length === 1 && filteredUpperLeaves[0].id === 703, "Filter matches 'REJECTED' case-insensitively");

      // GET /api/leaves/filter with non-matching status
      const noMatchRes = await fetch(`${BASE_URL}/api/leaves/filter?status=unknown_status`);
      const noMatchLeaves = await noMatchRes.json();
      assert(noMatchRes.status === 200, "GET /api/leaves/filter with non-matching status returns HTTP 200");
      assert(Array.isArray(noMatchLeaves) && noMatchLeaves.length === 0, "Non-matching filter returns an empty array []");

      // GET /api/leaves/filter without status query param
      const noParamRes = await fetch(`${BASE_URL}/api/leaves/filter`);
      assert(noParamRes.status === 400, "GET /api/leaves/filter without status param returns HTTP 400");

      // -----------------------------------------------------------
      // TEST 5: GET /api/leaves/:id (Get by ID)
      // -----------------------------------------------------------
      console.log("\n--- Test Group 5: GET By ID (GET /api/leaves/:id) ---");
      const getByIdRes = await fetch(`${BASE_URL}/api/leaves/701`);
      const record701 = await getByIdRes.json();
      assert(getByIdRes.status === 200, "GET /api/leaves/701 returns HTTP 200");
      assert(record701.id === 701 && record701.employeeName === "Ananya Singh", "Record 701 matches Ananya Singh");

      // Non-existent ID
      const notFoundRes = await fetch(`${BASE_URL}/api/leaves/999`);
      assert(notFoundRes.status === 404, "GET /api/leaves/999 returns HTTP 404");

      // Non-numeric ID
      const invalidIdRes = await fetch(`${BASE_URL}/api/leaves/invalid_id`);
      assert(invalidIdRes.status === 400, "GET /api/leaves/invalid_id returns HTTP 400");

      // -----------------------------------------------------------
      // TEST 6: PUT /api/leaves/:id (Update Record)
      // -----------------------------------------------------------
      console.log("\n--- Test Group 6: PUT / Update Record (PUT /api/leaves/:id) ---");
      const updatePayload = {
        employeeName: "Ananya Singh",
        employeeCode: "EMP101",
        leaveType: "Casual",
        days: 2,
        status: "Approved"
      };

      const putRes = await fetch(`${BASE_URL}/api/leaves/701`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload)
      });
      const updated701 = await putRes.json();
      assert(putRes.status === 200, "PUT /api/leaves/701 returns HTTP 200");
      assert(updated701.id === 701, "Updated record preserves its original ID (701)");
      assert(updated701.status === "Approved", "Updated record status changed to 'Approved'");

      // PUT non-existent ID
      const putNotFoundRes = await fetch(`${BASE_URL}/api/leaves/999`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload)
      });
      assert(putNotFoundRes.status === 404, "PUT /api/leaves/999 returns HTTP 404");

      // PUT invalid body (e.g. invalid days)
      const putInvalidRes = await fetch(`${BASE_URL}/api/leaves/701`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updatePayload, days: -1 })
      });
      assert(putInvalidRes.status === 400, "PUT with invalid days returns HTTP 400");

      // -----------------------------------------------------------
      // TEST 7: DELETE /api/leaves/:id (Delete Record)
      // -----------------------------------------------------------
      console.log("\n--- Test Group 7: DELETE Record (DELETE /api/leaves/:id) ---");
      const deleteRes = await fetch(`${BASE_URL}/api/leaves/702`, {
        method: "DELETE"
      });
      const deleteData = await deleteRes.json();
      assert(deleteRes.status === 200, "DELETE /api/leaves/702 returns HTTP 200");
      assert(deleteData.message.includes("deleted successfully"), "DELETE response contains success message");
      assert(deleteData.deletedRecord && deleteData.deletedRecord.id === 702, "Deleted record data returned");

      // Verify record 702 no longer exists
      const verifyDeletedRes = await fetch(`${BASE_URL}/api/leaves/702`);
      assert(verifyDeletedRes.status === 404, "GET /api/leaves/702 now returns HTTP 404");

      // DELETE non-existent ID
      const deleteNotFoundRes = await fetch(`${BASE_URL}/api/leaves/999`, {
        method: "DELETE"
      });
      assert(deleteNotFoundRes.status === 404, "DELETE /api/leaves/999 returns HTTP 404");

      // -----------------------------------------------------------
      // SUMMARY
      // -----------------------------------------------------------
      console.log("\n=======================================================");
      console.log(`TEST SUMMARY: Total: ${passedCount + failedCount} | Passed: ${passedCount} | Failed: ${failedCount}`);
      console.log("=======================================================\n");

      if (failedCount === 0) {
        console.log("ALL TESTS PASSED WITH 100% SUCCESS!\n");
      }
    } catch (err) {
      console.error("Test execution error:", err);
    } finally {
      server.close();
      process.exit(failedCount === 0 ? 0 : 1);
    }
  });
}

runTests();
