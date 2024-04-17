require('dotenv').config();
const express = require('express');
const http = require('http');
const https = require('https'); // For HTTPS support
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { Server } = require('socket.io');
const app = express();
const rateLimit = require('express-rate-limit');
const Message = require('./models/messageModel');
const multer = require('multer'); // For handling multipart/form-data
const fs = require('fs');
const winston = require('winston'); // Logging library
require('winston-daily-rotate-file');

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf(info => {
      // Anonymizing potentially sensitive information
      let message = info.message;
      if (message.includes('password')) {
        message = message.replace(/password":".*?"/, 'password":"[REDACTED]"');
      }
      // Anonymize IP addresses and other potentially identifying information
      message = message.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/, '[IP]');
      message = message.replace(/username":".*?"/, 'username":"[USERNAME]"');
      return `${info.timestamp} ${info.level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB successfully.');
  })
  .catch((error) => {
    logger.error('Failed to connect to MongoDB:', error.message, error.stack);
    process.exit(1);
  });

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN, // Only allow requests from specified origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", 'http:', 'https:', 'data:', 'ws:', 'wss:', 'blob:'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'http:', 'https:'],
      connectSrc: ["'self'", 'http:', 'https:', 'ws:', 'wss:', process.env.CSP_CONNECT_SRC],
      imgSrc: ["'self'", 'data:', 'http:', 'https:', 'blob:', 'http://localhost', 'https://localhost'],
      styleSrc: ["'self'", "'unsafe-inline'", 'http:', 'https:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  }
}));
app.use(compression());
app.use(express.json());
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Multer configuration for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'uploads/')); // Temporarily save files in the uploads directory
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName = file.fieldname + '-' + Date.now() + fileExt; // Create a unique file name
      cb(null, fileName);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    // Validate file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|aac|flac|m4a|m4p|mp3|wav|wma|mkv|avi|wmv|rmvb|m4v|mpg|mpeg|3gp|text\/plain|image\/jpeg|image\/png|application\/pdf|video\/mp4|image\/gif|audio\/aac|audio\/flac|audio\/m4a|audio\/m4p|audio\/mp3|audio\/wav|audio\/wma|video\/mkv|video\/avi|video\/wmv|video\/rmvb|video\/m4v|video\/mpg|video\/mpeg|video\/3gp|audio\/mpeg/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimeType && extName) {
      return cb(null, true);
    }
    cb(new Error('Unsupported file type'), false);
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Rate limiting middleware for authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many requests, please try again later.'
});

// Serve favicon with appropriate CORS headers
app.get('/favicon.ico', (req, res) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// Ping Route for Health Check
app.get('/ping', (req, res) => {
  res.status(200).send('OK');
  logger.info('Ping route was called, server is up and running.');
});

// Root Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  logger.info('Root route was accessed, serving index.html.');
});

// Initialize Server with optional HTTPS support
let server;
if (process.env.HTTPS_ENABLE === 'true') {
  const privateKey = fs.readFileSync(process.env.HTTPS_KEY_PATH, 'utf8');
  const certificate = fs.readFileSync(process.env.HTTPS_CERT_PATH, 'utf8');
  const credentials = { key: privateKey, cert: certificate };
  server = https.createServer(credentials, app);
} else {
  server = http.createServer(app);
}

// Initialize socket.io with origin validation
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN, // Only allow requests from specified origin
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  logger.info('A user connected');

  socket.on('newMessage', async ({ message, username, fileUrl, fileType }) => {
    try {
      username = username || 'Anonymous'; // Default username if not provided
      if (!message && !fileUrl) {
        logger.info('Message sending failed: Either message content or a file is required.');
        socket.emit('error', { message: 'Message sending failed: Either message content or a file is required.' });
        return;
      }
      // Check if message length exceeds 250 characters
      if (message && message.length > 250) {
        logger.error('Message sending failed: Message exceeds 250 characters.');
        socket.emit('error', { message: 'Message sending failed: Message exceeds 250 characters.' });
        return;
      }
      const newMessage = await Message.create({
        content: message,
        timestamp: new Date(),
        fileType: fileType || 'none',
        fileUrl: fileUrl || ''
      });
      io.emit('message', { content: newMessage.content, timestamp: newMessage.timestamp, username: username, fileUrl: newMessage.fileUrl, fileType: newMessage.fileType });
      logger.info(`Message broadcasted: ${message || 'File'} by ${username}`);
    } catch (error) {
      logger.error('Error saving new message:', error.message, error.stack);
      socket.emit('error', { message: 'Error sending message. Please try again later.', error: error.message, stack: error.stack });
    }
  });

  // Handle username change within the WebSocket session scope
  socket.on('setUsername', ({ username }) => {
    if (!username || username.length > 15) {
      const errorMessage = !username ? 'Username change failed: Username is required.' : 'Username must be 15 characters or less.';
      logger.info(errorMessage);
      socket.emit('error', { message: errorMessage });
      return;
    }
    logger.info(`Username set to ${username} for this session.`);
    socket.username = username; // Assign the new username to the socket session
    socket.emit('usernameUpdated', { username: username });
  });

  socket.on('disconnect', () => {
    logger.info(`A user disconnected`);
  });

  socket.on('error', (error) => {
    logger.error('Socket encountered an error:', error.message, error.stack);
  });
});

// File upload route with error handling
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    logger.error('No file uploaded or invalid file type.');
    return res.status(400).json({ success: false, message: 'No file uploaded or invalid file type.' });
  }
  // Respond with the file's URL after successful upload
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ success: true, fileUrl: fileUrl });
}, (error, req, res, next) => {
  // Error handling for file upload
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    logger.error('File upload error: File upload exceeded the 10MB limit.', error.message, error.stack);
    res.status(400).json({ success: false, message: 'File upload exceeded the 10MB limit.' });
  } else if (error) {
    logger.error('File upload error:', error.message, error.stack);
    res.status(400).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 8000; // Define PORT variable to use environment variable or default to 8000

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

server.on('error', (error) => {
  logger.error('Server encountered an error:', error.message, error.stack);
  process.exit(1);
});