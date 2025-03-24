const axios = require('axios');

// Middleware to verify JWT token by calling Spring Boot service
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token with Spring Boot service
    const response = await axios.post(process.env.SPRING_AUTH_URL, 
      { token }, 
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    if (response.data && response.data.valid) {
      // Store user info from token in request object
      req.user = response.data.user;
      next();
    } else {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(500).json({ message: 'Authentication failed' });
  }
};

module.exports = verifyToken;