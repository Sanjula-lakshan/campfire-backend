require('dotenv').config();  // Load environment variables
const http = require('http');
const app = require('./app');  // Import app.js (Make sure the path is correct)
const connectDB = require('./config/db');
const setupSocket = require('./config/socket');

// Debugging to check if server.js is executing
console.log("server.js script is executing...");

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.io (assuming it's in 'config/socket.js')
const io = setupSocket(server);

// Set port
const PORT = process.env.PORT || 5000;

// Allow external connections (important for remote access)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('MongoDB connection established');
  console.log('WebSocket server initialized');
});

// If there are any errors, log them to the console
server.on('error', (err) => {
  console.error('Server error:', err);
});
