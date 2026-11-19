// Import EventEmitter module
const EventEmitter = require('events');

// Create EventEmitter object
const emitter = new EventEmitter();

// Register Load Event
emitter.on("load", (name) => {
  console.log(`welcome, ${name}!`);
});

// Register Exit Event
emitter.on("exit", () => {
  console.log("program is exiting...");
});

// Trigger Load Event
emitter.emit("load", "Krishna");

// Trigger Exit Event
emitter.emit("exit");
