// Import EventEmitter module
const EventEmitter = require('events');

// Create a custom EventEmitter class
class MyEmitter extends EventEmitter {}

// Create an emitter object
const emitter = new MyEmitter();

// Register Greet Event
emitter.on('greet', (name) => {
  console.log(`Hello, ${name}!`);
});

// Register Exit Event
emitter.on('exit', () => {
  console.log('Goodbye! Program is exiting...');
});

// Trigger Greet Event
emitter.emit('greet', 'Krishna');

// Trigger Exit Event
emitter.emit('exit');
