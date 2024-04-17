const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  content: { type: String, required: false }, // Content is not required if there's a file
  timestamp: { type: Date, default: Date.now },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: false }, // Made sender field not required
  fileType: { type: String, required: false, enum: ['none', 'image/jpeg', 'image/png', 'application/pdf', 'video/mp4', 'text/plain', 'image/gif', 'audio/aac', 'audio/flac', 'audio/m4a', 'audio/m4p', 'audio/mp3', 'audio/wav', 'audio/wma', 'video/mkv', 'video/avi', 'video/wmv', 'video/rmvb', 'video/m4v', 'video/mpg', 'video/mpeg', 'video/3gp', 'audio/mpeg'] }, // Type of file if any
  fileUrl: { type: String, required: false }, // URL to the file if any
  fileName: { type: String, required: false } // Name of the file if any
});

messageSchema.pre('save', async function(next) {
  try {
    if (!this.content && !this.fileUrl) {
      throw new Error('Either message content or a file URL is required.');
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Message', messageSchema);