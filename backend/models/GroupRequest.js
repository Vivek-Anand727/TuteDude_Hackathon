// models/GroupRequest.js
const mongoose = require('mongoose');

const groupRequestSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
    unique: true, // One request per group
  },
  item: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: String, // e.g., "500kg", "1000 units" - total group quantity
    required: true,
    trim: true,
  },
  desiredPrice: {
    type: Number, // per unit price that group wants
    required: true,
    min: 0,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String, // Additional details about the group requirement
    trim: true,
    default: '',
  },
  category: {
    type: String, // e.g., "vegetables", "fruits", "grains", "dairy"
    trim: true,
    default: 'general',
  },
  deliveryPreference: {
    type: String,
    enum: ['pickup', 'delivery', 'both'],
    default: 'both',
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired', 'cancelled'],
    default: 'active',
  },
  acceptedOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupOffer',
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
    default: true, // Whether suppliers can see this group request
  },
  minOffers: {
    type: Number,
    default: 1, // Minimum offers required before group leader can accept
  },
  negotiationRounds: {
    type: Number,
    default: 0, // Track how many negotiation rounds have happened
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // Auto-expire after 3 days for group requests (shorter than individual)
      return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
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

// ====== MIDDLEWARE ======

// Update the updatedAt field before saving
groupRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Automatically expire requests
groupRequestSchema.pre('find', function() {
  this.where({ expiresAt: { $gt: new Date() } });
});

groupRequestSchema.pre('findOne', function() {
  this.where({ expiresAt: { $gt: new Date() } });
});

// ====== STATIC METHODS ======

// Static method to expire old group requests
groupRequestSchema.statics.expireOldRequests = async function() {
  const result = await this.updateMany(
    { 
      expiresAt: { $lte: new Date() },
      status: 'active'
    },
    { 
      status: 'expired' 
    }
  );
  return result;
};

// Get active group requests with filters
groupRequestSchema.statics.getActiveRequests = async function(filters = {}) {
  const query = { 
    status: 'active',
    isPublic: true,
    expiresAt: { $gt: new Date() }
  };

  // Add filters
  if (filters.item) {
    query.item = new RegExp(filters.item, 'i');
  }
  if (filters.location) {
    query.location = new RegExp(filters.location, 'i');
  }
  if (filters.minPrice) {
    query.desiredPrice = { ...query.desiredPrice, $gte: parseFloat(filters.minPrice) };
  }
  if (filters.maxPrice) {
    query.desiredPrice = { ...query.desiredPrice, $lte: parseFloat(filters.maxPrice) };
  }
  if (filters.category) {
    query.category = filters.category;
  }

  return this.find(query)
    .populate({
      path: 'group',
      populate: {
        path: 'leader',
        select: 'name email phone location'
      }
    })
    .sort({ createdAt: -1 });
};

// ====== INSTANCE METHODS ======

// Check if request can be modified
groupRequestSchema.methods.canModify = function() {
  return this.status === 'active' && this.expiresAt > new Date();
};

// Check if request can accept offers
groupRequestSchema.methods.canAcceptOffers = function() {
  return this.status === 'active' && 
         this.expiresAt > new Date() && 
         this.offersCount >= this.minOffers;
};

// Get summary for supplier view
groupRequestSchema.methods.getSupplierSummary = function() {
  return {
    _id: this._id,
    item: this.item,
    quantity: this.quantity,
    desiredPrice: this.desiredPrice,
    location: this.location,
    description: this.description,
    category: this.category,
    deliveryPreference: this.deliveryPreference,
    offersCount: this.offersCount,
    viewsCount: this.viewsCount,
    expiresAt: this.expiresAt,
    createdAt: this.createdAt,
    group: {
      _id: this.group._id,
      name: this.group.name,
      memberCount: this.group.members ? this.group.members.length : 0,
      leader: this.group.leader
    }
  };
};

// ====== INDEXES FOR PERFORMANCE ======

// Compound indexes for common queries
groupRequestSchema.index({ status: 1, expiresAt: 1 });
groupRequestSchema.index({ status: 1, isPublic: 1, expiresAt: 1 });
groupRequestSchema.index({ group: 1 }, { unique: true }); // One request per group
groupRequestSchema.index({ item: 'text', location: 'text', description: 'text' }); // Text search
groupRequestSchema.index({ desiredPrice: 1 });
groupRequestSchema.index({ category: 1 });
groupRequestSchema.index({ createdAt: -1 });
groupRequestSchema.index({ location: 1 });

// ====== VALIDATION ======

// Custom validation for quantity format
groupRequestSchema.path('quantity').validate(function(value) {
  // Should match pattern like "100kg", "500 units", "10 tons"
  return /^\d+(?:\.\d+)?\s*[a-zA-Z]+$/.test(value.trim());
}, 'Quantity should be in format like "100kg" or "500 units"');

// Custom validation for price
groupRequestSchema.path('desiredPrice').validate(function(value) {
  return value > 0;
}, 'Desired price must be greater than 0');

// Custom validation for expiration
groupRequestSchema.path('expiresAt').validate(function(value) {
  return value > new Date();
}, 'Expiration date must be in the future');

// ====== VIRTUAL FIELDS ======

// Virtual for time remaining
groupRequestSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const timeDiff = this.expiresAt - now;
  
  if (timeDiff <= 0) return 'Expired';
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  return 'Less than an hour remaining';
});

// Virtual for total estimated value
groupRequestSchema.virtual('estimatedTotalValue').get(function() {
  // Extract numeric part from quantity and multiply by desired price
  const quantityMatch = this.quantity.match(/(\d+(?:\.\d+)?)/);
  if (quantityMatch) {
    const numericQuantity = parseFloat(quantityMatch[1]);
    return numericQuantity * this.desiredPrice;
  }
  return 0;
});

// Include virtuals when converting to JSON
groupRequestSchema.set('toJSON', { virtuals: true });
groupRequestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('GroupRequest', groupRequestSchema);