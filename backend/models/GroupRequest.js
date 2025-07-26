const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quantity: {
      type: String, // e.g., "50kg", "100 units" - individual member's need
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    }
  }],
  item: {
    type: String,
    required: true,
  },
  totalQuantity: {
    type: String, // e.g., "500kg" - sum of all member quantities
    required: true,
  },
  desiredPrice: {
    type: Number, // per unit price that group wants
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['forming', 'active', 'negotiating', 'deal_closed', 'cancelled'],
    default: 'forming',
  },
  maxMembers: {
    type: Number,
    default: 20,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
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
groupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Group', groupSchema);
