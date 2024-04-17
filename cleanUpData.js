require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

const Message = require('./models/messageModel');
const User = require('./models/userModel');
const logger = require('./config/logger');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('Connected to MongoDB successfully for data cleanup.'))
  .catch((error) => logger.error('Failed to connect to MongoDB for data cleanup:', error.message, error.stack));

const deleteAllData = async () => {
  try {
    await Message.deleteMany({});
    logger.info('All messages have been deleted successfully.');

    await User.deleteMany({});
    logger.info('All users have been deleted successfully.');

    const uploadsDir = path.join(__dirname, 'uploads');
    const files = await readdir(uploadsDir);
    for (const file of files) {
      await unlink(path.join(uploadsDir, file));
    }
    logger.info('All files in the uploads directory have been deleted successfully.');
  } catch (error) {
    logger.error('Error during data cleanup:', error.message, error.stack);
  } finally {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed after data cleanup.');
  }
};

deleteAllData();