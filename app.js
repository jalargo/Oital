const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const dotenv = require('dotenv');
const uploadRoutes = require('./routes/upload.routes');

dotenv.config();

const app = express();
const storage = multer.memoryStorage(); // for simplicity, using memory storage. Consider using cloud storage in production.
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.static('public')); // Serve static files from the public directory

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api', uploadRoutes);

// File upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    console.log('No file received');
    return res.status(400).send('No file uploaded.');
  }

  // Simulate file upload and return a URL
  console.log('File uploaded successfully');
  res.json({ message: 'File uploaded successfully', fileUrl: 'URL_of_the_uploaded_file' }); // INPUT_REQUIRED {Provide actual implementation for file storage and replace this URL}
});

// Placeholder for other routes

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on port ${process.env.PORT || 8000}`);
});