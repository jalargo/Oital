const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: false, // since we might have messages that only contain multimedia
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'audio', 'video', 'file'],
    default: 'text',
  },
  // Store references to uploaded files/multimedia
  attachments: [{
    fileType: {
      type: String,
      enum: ['image', 'audio', 'video', 'file'],
    },
    url: {
      type: String,
      required: true,
    }
  }],
  reactions: [{
    emoji: String,
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
}, {timestamps: true});

messageSchema.pre('save', function(next) {
  if (!this.content && (!this.attachments || this.attachments.length === 0)) {
    const err = new Error('A message must have either content or attachments.');
    console.error('Error saving message:', err);
    next(err);
  } else {
    console.log('Message saved successfully.');
    next();
  }
});

messageSchema.post('save', function(doc, next) {
  console.log(`Message with id ${doc._id} has been saved.`);
  next();
});

messageSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    console.error('Error due to duplicate:', error);
    next(new Error('Duplicate key error.'));
  } else if (error) {
    console.error('Error saving the message:', error);
    next(error);
  } else {
    next();
  }
});

module.exports = mongoose.model('Message', messageSchema);