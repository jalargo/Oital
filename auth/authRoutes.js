const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const router = express.Router();
const rateLimit = require('express-rate-limit'); // Importing express-rate-limit for rate limiting

// Rate limiter for registration and login routes
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many requests, please try again later.',
});

// Email validation utility
const validateEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
  return re.test(String(email).toLowerCase());
};

// Register User
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      console.log('Registration failed: Missing username, password, or email');
      return res.status(400).json({ message: 'Registration failed: Missing username, password, or email' });
    }
    if (!validateEmail(email)) {
      console.log('Registration failed: Invalid email format');
      return res.status(400).json({ message: 'Registration failed: Invalid email format' });
    }
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const existingUsername = await User.findOne({ username: trimmedUsername });
    const existingEmail = await User.findOne({ email: trimmedEmail });
    if (existingUsername) {
      console.log(`Registration failed: Username already exists - ${trimmedUsername}`);
      return res.status(409).json({ message: 'Registration failed: Username already exists' });
    }
    if (existingEmail) {
      console.log(`Registration failed: Email already exists - ${trimmedEmail}`);
      return res.status(409).json({ message: 'Registration failed: Email already exists' });
    }
    const newUser = new User({ username: trimmedUsername, password: password.trim(), email: trimmedEmail });
    await newUser.save();

    console.log(`User registered: ${trimmedUsername}`);
    res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
  } catch (error) {
    console.error("Error registering user: ", error.message, error.stack);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login User
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      console.log('Login failed: Missing username or password');
      return res.status(400).json({ message: 'Login failed: Missing username or password' });
    }
    const trimmedUsername = username.trim();
    const user = await User.findOne({ username: trimmedUsername });

    if (!user) {
      console.log(`Login failed: User not found - ${trimmedUsername}`);
      return res.status(401).json({ message: 'Login failed: User not found' });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      console.log(`Login failed: Incorrect password for user - ${trimmedUsername}`);
      return res.status(401).json({ message: 'Login failed: Incorrect password' });
    }

    // Logging for debugging purposes
    console.log(`Password match for user - ${trimmedUsername}: ${isMatch}`);

    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(`User logged in: ${trimmedUsername}`);
    res.status(200).json({ message: 'Login successful', token, userId: user._id }); // Include userId in the login response
  } catch (error) {
    console.error("Error logging in: ", error.message, error.stack);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

module.exports = router;