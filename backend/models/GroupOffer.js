const mongoose = require('mongoose');

const groupOfferSchema = new mongoose.Schema({
  groupRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupRequest',
    required: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  offeredPrice: {
    type: Number, // per unit price offered by supplier
    required: true,
  },
  totalPrice: {
    type: Number, // total amount for the entire group order
    required: true,
  },
  eta: {
    type: String, // e.g., "2 days", "1 week"
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
    enum: ['pending', 'viewed', 'under_negotiation', 'accepted', 'rejected', 'countered', 'expired'],
    default: 'pending',
  },
  negotiationHistory: [{
    by: {
      type: String,
      enum: ['supplier', 'leader'],
      required: true,
    },
    action: {
      type: String,
      enum: ['initial_offer', 'counter_offer', 'accept', 'reject', 'message'],
      required: true,
    },
    offeredPrice: Number,
    totalPrice: Number,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now,
    }
  }],
  viewedByLeader: {
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

groupOfferSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('GroupOffer', groupOfferSchema);