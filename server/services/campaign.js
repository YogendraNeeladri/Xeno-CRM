const Campaign = require('../models/Campaign');
const Segment = require('../models/Segment');
const Customer = require('../models/Customer');
const CommunicationLog = require('../models/CommunicationLog');
const aiService = require('./ai');
const { sendEmail } = require('./email');
const { sendSMS } = require('./sms');

// Create a new campaign
const createCampaign = async (campaignData) => {
  try {
    // Generate message variants using AI
    const messageVariants = await aiService.generateMessageVariants(
      campaignData.goal,
      campaignData.targetSegment
    );

    // Auto-tag the campaign
    const tags = await aiService.autoTagCampaign(campaignData);

    const campaign = new Campaign({
      ...campaignData,
      messageVariants,
      tags,
      status: 'draft'
    });

    await campaign.save();
    return campaign;
  } catch (error) {
    throw new Error('Error creating campaign: ' + error.message);
  }
};

// Schedule a campaign
const scheduleCampaign = async (campaignId, scheduleData) => {
  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Get target segment
    const segment = await Segment.findById(campaign.targetSegment);
    if (!segment) {
      throw new Error('Target segment not found');
    }

    // Get customers in segment
    const customers = await Customer.find(segment.getQuery());

    // Predict optimal send time for each customer
    const scheduledDeliveries = await Promise.all(
      customers.map(async (customer) => {
        const optimalTime = await aiService.predictSendTime(
          customer.toJSON(),
          campaign.type
        );
        return {
          customerId: customer._id,
          scheduledTime: optimalTime,
          status: 'scheduled'
        };
      })
    );

    campaign.schedule = {
      startDate: scheduleData.startDate,
      endDate: scheduleData.endDate,
      deliveries: scheduledDeliveries
    };
    campaign.status = 'scheduled';

    await campaign.save();
    return campaign;
  } catch (error) {
    throw new Error('Error scheduling campaign: ' + error.message);
  }
};

// Execute campaign delivery
const executeCampaign = async (campaignId) => {
  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const now = new Date();
    const pendingDeliveries = campaign.schedule.deliveries.filter(
      (delivery) => delivery.status === 'scheduled' && delivery.scheduledTime <= now
    );

    for (const delivery of pendingDeliveries) {
      const customer = await Customer.findById(delivery.customerId);
      if (!customer) continue;

      // Select best message variant based on customer profile
      const selectedVariant = selectBestMessageVariant(campaign.messageVariants, customer);

      // Send communication
      let communicationResult;
      if (campaign.channel === 'email') {
        communicationResult = await sendEmail({
          to: customer.email,
          subject: selectedVariant.subject,
          body: selectedVariant.body,
          campaignId: campaign._id
        });
      } else if (campaign.channel === 'sms') {
        communicationResult = await sendSMS({
          to: customer.phone,
          message: selectedVariant.body,
          campaignId: campaign._id
        });
      }

      // Log communication
      await CommunicationLog.create({
        campaignId: campaign._id,
        customerId: customer._id,
        channel: campaign.channel,
        status: communicationResult.success ? 'sent' : 'failed',
        message: selectedVariant,
        error: communicationResult.error
      });

      // Update delivery status
      delivery.status = communicationResult.success ? 'delivered' : 'failed';
      delivery.deliveredAt = new Date();
    }

    // Update campaign status if all deliveries are complete
    const allDelivered = campaign.schedule.deliveries.every(
      (delivery) => delivery.status !== 'scheduled'
    );
    if (allDelivered) {
      campaign.status = 'completed';
    }

    await campaign.save();
    return campaign;
  } catch (error) {
    throw new Error('Error executing campaign: ' + error.message);
  }
};

// Generate campaign report
const generateCampaignReport = async (campaignId) => {
  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Get communication logs
    const logs = await CommunicationLog.find({ campaignId });

    // Calculate statistics
    const stats = {
      totalDeliveries: logs.length,
      successfulDeliveries: logs.filter(log => log.status === 'sent').length,
      failedDeliveries: logs.filter(log => log.status === 'failed').length,
      deliveryRate: (logs.filter(log => log.status === 'sent').length / logs.length) * 100,
      channelBreakdown: logs.reduce((acc, log) => {
        acc[log.channel] = (acc[log.channel] || 0) + 1;
        return acc;
      }, {})
    };

    // Generate AI summary
    const summary = await aiService.generateCampaignSummary(stats);

    return {
      campaign,
      stats,
      summary
    };
  } catch (error) {
    throw new Error('Error generating campaign report: ' + error.message);
  }
};

// Helper function to select best message variant
const selectBestMessageVariant = (variants, customer) => {
  // Simple selection based on customer tags and preferences
  // In a real implementation, this could use more sophisticated logic
  const customerTags = customer.tags || [];
  const variant = variants.find(v => 
    v.tags && v.tags.some(tag => customerTags.includes(tag))
  ) || variants[0];

  return variant;
};

module.exports = {
  createCampaign,
  scheduleCampaign,
  executeCampaign,
  generateCampaignReport
}; 