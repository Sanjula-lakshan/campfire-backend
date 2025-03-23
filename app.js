const express = require('express');
const cors = require('cors');
const sessionRoutes = require('./routes/sessionRoutes'); // Make sure sessionRoutes are properly defined

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route (make sure this is added and above the 404 route)
app.get('/api/test', (req, res) => {
  console.log('Test route hit!');
  res.json({ message: 'Test route is working!' });
});

// Session routes (Make sure the session routes are properly registered)
app.use('/api/sessions', sessionRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Mental Health Video Conference API is running');
});

// Not found route (Should be last)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
