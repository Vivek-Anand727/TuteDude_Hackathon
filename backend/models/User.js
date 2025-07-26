const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['vendor', 'supplier'],
    required: true,
  },
  phone: {
    type: String,
  },
  location: {
    type: String,
    required: true, // e.g., "110024" or "Lajpat Nagar"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('User', userSchema);
