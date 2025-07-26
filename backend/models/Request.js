const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  item: {
    type: String,
    required: true,
  },
  quantity: {
    type: String, // e.g., "10kg", "500 units"
    required: true,
  },
  desiredPrice: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true, // delivery or pickup area
  },
  status: {
    type: String,
    enum: ['open', 'fulfilled', 'expired'],
    default: 'open',
  },
  acceptedOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Request', requestSchema);
