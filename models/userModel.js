const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const winston = require('winston'); // Logging library

// Email validation utility
const validateEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
  return re.test(String(email).toLowerCase());
};

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: validateEmail,
      message: props => `${props.value} is not a valid email address!`
    }
  }
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
      // Anonymize username in log
      winston.info('Password hashed successfully for a user');
      return next();
    } catch (error) {
      // Log the error with stack trace but anonymize sensitive data
      winston.error("Error hashing password during user save: ", error.message, error.stack);
      return next(error);
    }
  } else {
    return next();
  }
});

module.exports = mongoose.model('User', userSchema);