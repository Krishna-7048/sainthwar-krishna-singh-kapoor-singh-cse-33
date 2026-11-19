// Import HTTP module
const http = require("http");

// Create HTTP Server
const server = http.createServer((req, res) => {
  // Set HTTP Status Code and Response Headers
  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Server": "node.js"
  });

  // Send Response to Client
  res.end("Hello, World!");
});

// Define Server Port
const PORT = 3007;

// Start the Server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
