const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSettingsSchema = new Schema({
  theme: { type: String, default: 'default' }
});

userSettingsSchema.pre('save', function(next) {
  console.log(`Saving user settings with theme: ${this.theme}`);
  next();
});

userSettingsSchema.post('save', function(doc) {
  console.log(`User settings saved with theme: ${doc.theme}`);
});

userSettingsSchema.post('findOneAndUpdate', function(doc) {
  if (doc) {
    console.log(`User settings updated with theme: ${doc.theme}`);
  }
});

module.exports = mongoose.model('UserSettings', userSettingsSchema);