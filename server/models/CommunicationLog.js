const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  channel: {
    type: String,
    enum: ['email', 'sms', 'push', 'whatsapp'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked'],
    default: 'pending'
  },
  message: {
    subject: String,
    body: String,
    template: String,
    variables: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  deliveryAttempts: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['success', 'failed']
    },
    error: String,
    response: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
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
communicationLogSchema.index({ campaign: 1 });
communicationLogSchema.index({ customer: 1 });
communicationLogSchema.index({ status: 1 });
communicationLogSchema.index({ createdAt: -1 });
communicationLogSchema.index({ 'deliveryAttempts.timestamp': -1 });

// Method to add delivery attempt
communicationLogSchema.methods.addDeliveryAttempt = async function(attempt) {
  this.deliveryAttempts.push(attempt);
  this.status = attempt.status === 'success' ? 'sent' : 'failed';
  return this.save();
};

// Method to update status
communicationLogSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Static method to find logs by campaign
communicationLogSchema.statics.findByCampaign = async function(campaignId) {
  return this.find({ campaign: campaignId })
    .populate('customer')
    .sort({ createdAt: -1 });
};

// Static method to get campaign statistics
communicationLogSchema.statics.getCampaignStats = async function(campaignId) {
  const stats = await this.aggregate([
    { $match: { campaign: mongoose.Types.ObjectId(campaignId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});
};

const CommunicationLog = mongoose.model('CommunicationLog', communicationLogSchema);

module.exports = CommunicationLog; 