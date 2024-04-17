const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const winston = require('winston');

const chatRoomSchema = new Schema({
  roomName: { type: String, required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

chatRoomSchema.pre('save', function(next) {
  winston.info(`Saving chat room: ${this.roomName}`);
  next();
});

chatRoomSchema.post('save', function(doc, next) {
  winston.info(`Chat room saved: ${doc.roomName}`);
  next();
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);