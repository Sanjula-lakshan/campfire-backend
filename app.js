const express = require('express');
const cors = require('cors');
const sessionRoutes = require('./routes/sessionRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sessions', sessionRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Mental Health Video Conference API is running');
});

// Not found route
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;