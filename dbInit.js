require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/userModel');
const ChatRoom = require('./models/chatRoomModel');
const logger = require('./config/logger'); // Importing the logger for consistent logging

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('Connected to MongoDB successfully.'))
  .catch((error) => logger.error('Failed to connect to MongoDB:', error.message, error.stack));

const createDefaultUserAndRoom = async () => {
  try {
    const defaultUser = await User.findOne({ username: 'DefaultUser' });
    if (!defaultUser) {
      const hashedPassword = await bcrypt.hash(process.env.DEFAULT_USER_PASSWORD, 10);
      await User.create({
        username: 'DefaultUser',
        password: hashedPassword,
        email: process.env.DEFAULT_USER_EMAIL
      });
      logger.info('Default user created successfully.');
    } else {
      logger.info('Default user already exists.');
    }

    const defaultRoom = await ChatRoom.findOne({ roomName: 'DefaultRoom' });
    if (!defaultRoom) {
      await ChatRoom.create({
        roomName: 'DefaultRoom',
        members: defaultUser ? [defaultUser._id] : []
      });
      logger.info('Default chat room created successfully.');
    } else {
      logger.info('Default chat room already exists.');
    }
  } catch (error) {
    logger.error('Error creating default user and room:', error.message, error.stack);
  }
};

createDefaultUserAndRoom();