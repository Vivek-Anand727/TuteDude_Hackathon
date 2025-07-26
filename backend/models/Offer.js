// models/Offer.js (Individual offers - minor improvements)
const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  offeredPrice: {
    type: Number,
    required: true,
  },
  eta: {
    type: String, // e.g., "1 hour", "30 mins"
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  deliveryOptions: {
    canPickup: {
      type: Boolean,
      default: true,
    },
    canDeliver: {
      type: Boolean,
      default: false,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    }
  },
  status: {
    type: String,
    enum: ['pending', 'viewed', 'accepted', 'rejected', 'countered'],
    default: 'pending',
  },
  viewedByVendor: {
    type: Boolean,
    default: false,
  },
  viewedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt field before saving
offerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Offer', offerSchema);
