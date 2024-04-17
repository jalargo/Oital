const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const logger = require('../config/logger'); // Importing the logger for consistent logging across the application

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.info('Authentication attempt without token or incorrect token format');
      return res.status(401).json({ message: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // INPUT_REQUIRED {Please ensure this environment variable is set to your JWT secret key.}
    req.user = decoded;

    // Check if user exists
    User.findById(decoded.userId, (err, user) => {
      if (err) {
        logger.error('Error during user lookup in token verification:', err.message, err.stack);
        return res.status(500).json({ message: 'Error finding user', error: 'An error occurred during user verification' });
      }
      if (!user) {
        logger.info('Token verification failed due to non-existent user');
        return res.status(404).json({ message: 'User not found' });
      }
      next();
    });
  } catch (error) {
    logger.error('Token verification error:', error.message, error.stack);
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else {
      return res.status(500).json({ message: 'Failed to authenticate token', error: 'Token authentication failed' });
    }
  }
};

module.exports = verifyToken;