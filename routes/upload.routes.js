const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // for example, limit file size to 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only images, audio, video, and PDFs are allowed!'), false);
    }
  },
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    console.error('No file uploaded.');
    return res.status(400).send('No file uploaded.');
  }

  const fileKey = `${uuidv4()}-${req.file.originalname}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    ACL: 'public-read', // make the file publicly accessible
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).send('Error uploading file.');
    }

    console.log('File uploaded successfully', { fileUrl: data.Location });
    res.json({ message: 'File uploaded successfully', fileUrl: data.Location });
  });
});

module.exports = router;