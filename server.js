require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const setupSocket = require('./config/socket');

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.io
const io = setupSocket(server);

// Set port
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('MongoDB connection established');
  console.log('WebSocket server initialized');
});