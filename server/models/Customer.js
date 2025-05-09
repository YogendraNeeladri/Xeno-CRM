const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  lastOrderDate: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
customerSchema.index({ email: 1 });
customerSchema.index({ totalSpent: -1 });
customerSchema.index({ lastOrderDate: -1 });
customerSchema.index({ tags: 1 });

// Virtual for customer's inactivity period
customerSchema.virtual('daysSinceLastOrder').get(function() {
  if (!this.lastOrderDate) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.lastOrderDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to update customer's total spent
customerSchema.methods.updateTotalSpent = async function(amount) {
  this.totalSpent += amount;
  this.lastOrderDate = new Date();
  return this.save();
};

// Static method to find customers by segment criteria
customerSchema.statics.findBySegmentCriteria = async function(criteria) {
  const query = {};
  
  if (criteria.minSpent) {
    query.totalSpent = { $gte: criteria.minSpent };
  }
  
  if (criteria.maxSpent) {
    query.totalSpent = { ...query.totalSpent, $lte: criteria.maxSpent };
  }
  
  if (criteria.inactiveDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - criteria.inactiveDays);
    query.lastOrderDate = { $lt: cutoffDate };
  }
  
  if (criteria.tags && criteria.tags.length > 0) {
    query.tags = { $in: criteria.tags };
  }
  
  return this.find(query);
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer; 