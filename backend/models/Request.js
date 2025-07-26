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
    trim: true,
  },
  quantity: {
    type: String, // e.g., "10kg", "500 units"
    required: true,
    trim: true,
  },
  desiredPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  location: {
    type: String,
    required: true, // delivery or pickup area
    trim: true,
  },
  description: {
    type: String, // Additional details about the item/requirement
    trim: true,
    default: '',
  },
  category: {
    type: String, // e.g., "vegetables", "fruits", "grains", "dairy"
    trim: true,
    default: 'general',
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  deliveryPreference: {
    type: String,
    enum: ['pickup', 'delivery', 'both'],
    default: 'both',
  },
  status: {
    type: String,
    enum: ['open', 'fulfilled', 'expired', 'cancelled'],
    default: 'open',
  },
  acceptedOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    default: null,
  },
  offersCount: {
    type: Number,
    default: 0,
  },
  viewsCount: {
    type: Number,
    default: 0,
  },
  isPublic: {
    type: Boolean,
    default: true, // Whether suppliers can see this request
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Auto-expire after 7 days
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
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
requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Automatically expire requests
requestSchema.pre('find', function() {
  this.where({ expiresAt: { $gt: new Date() } });
});

requestSchema.pre('findOne', function() {
  this.where({ expiresAt: { $gt: new Date() } });
});

// Static method to expire old requests
requestSchema.statics.expireOldRequests = async function() {
  const result = await this.updateMany(
    { 
      expiresAt: { $lte: new Date() },
      status: 'open'
    },
    { 
      status: 'expired' 
    }
  );
  return result;
};

// Indexes for better query performance
requestSchema.index({ vendor: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ item: 'text', location: 'text' }); // Text search
requestSchema.index({ desiredPrice: 1 });
requestSchema.index({ category: 1 });
requestSchema.index({ createdAt: -1 });
requestSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Request', requestSchema);