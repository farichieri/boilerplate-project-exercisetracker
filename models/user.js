let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  username: {
    type: String,
  },
  date: {
    type: String,
  },
  duration: {
    type: Number,
  },
  description: {
    type: String,
  },
  exercises: {
    type: [Object],
  },
});

module.exports = mongoose.model('User', userSchema);
