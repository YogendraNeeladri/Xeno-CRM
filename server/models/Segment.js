const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  rules: [{
    field: {
      type: String,
      required: true,
      enum: ['totalSpent', 'lastOrderDate', 'tags', 'city', 'country']
    },
    operator: {
      type: String,
      required: true,
      enum: ['equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'lessThan', 'between']
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    value2: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  ruleOperator: {
    type: String,
    enum: ['AND', 'OR'],
    default: 'AND'
  },
  customerCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better query performance
segmentSchema.index({ name: 1 });
segmentSchema.index({ createdBy: 1 });
segmentSchema.index({ isActive: 1 });

// Method to evaluate if a customer matches segment rules
segmentSchema.methods.evaluateCustomer = function(customer) {
  return this.rules.every(rule => {
    const value = customer[rule.field];
    
    switch (rule.operator) {
      case 'equals':
        return value === rule.value;
      case 'notEquals':
        return value !== rule.value;
      case 'contains':
        return Array.isArray(value) ? value.includes(rule.value) : value.includes(rule.value);
      case 'notContains':
        return Array.isArray(value) ? !value.includes(rule.value) : !value.includes(rule.value);
      case 'greaterThan':
        return value > rule.value;
      case 'lessThan':
        return value < rule.value;
      case 'between':
        return value >= rule.value && value <= rule.value2;
      default:
        return false;
    }
  });
};

// Method to update customer count
segmentSchema.methods.updateCustomerCount = async function() {
  const Customer = mongoose.model('Customer');
  const customers = await Customer.findBySegmentCriteria(this.rules);
  this.customerCount = customers.length;
  return this.save();
};

// Static method to find segments by criteria
segmentSchema.statics.findByCriteria = async function(criteria) {
  const query = {};
  
  if (criteria.name) {
    query.name = new RegExp(criteria.name, 'i');
  }
  
  if (criteria.isActive !== undefined) {
    query.isActive = criteria.isActive;
  }
  
  if (criteria.createdBy) {
    query.createdBy = criteria.createdBy;
  }
  
  return this.find(query).populate('createdBy');
};

const Segment = mongoose.model('Segment', segmentSchema);

module.exports = Segment; 