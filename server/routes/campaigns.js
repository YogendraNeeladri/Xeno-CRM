const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Segment = require('../models/Segment');
const Customer = require('../models/Customer');
const CommunicationLog = require('../models/CommunicationLog');
const { verifyToken, checkPermission } = require('../middleware/auth');
const { campaignValidation, queryValidation } = require('../middleware/validation');
const { publishToQueue } = require('../services/queue');
const campaignService = require('../services/campaign');
const { validateCampaign } = require('../middleware/validation');

// Get all campaigns with pagination
router.get('/',
  verifyToken,
  checkPermission('view_campaigns'),
  queryValidation.pagination,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const campaigns = await Campaign.find()
        .populate('segment', 'name customerCount')
        .populate('createdBy', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Campaign.countDocuments();

      res.json({
        success: true,
        data: campaigns,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching campaigns',
        error: error.message
      });
    }
  }
);

// Get campaign by ID
router.get('/:id',
  verifyToken,
  checkPermission('view_campaigns'),
  async (req, res) => {
    try {
      const campaign = await Campaign.findById(req.params.id)
        .populate('segment', 'name customerCount')
        .populate('createdBy', 'name email');

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      res.json({
        success: true,
        data: campaign
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching campaign',
        error: error.message
      });
    }
  }
);

// Create new campaign
router.post('/', verifyToken, validateCampaign, async (req, res) => {
  try {
    const campaign = await campaignService.createCampaign(req.body);
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Schedule a campaign
router.post('/:id/schedule', verifyToken, async (req, res) => {
  try {
    const campaign = await campaignService.scheduleCampaign(req.params.id, req.body);
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Execute a campaign
router.post('/:id/execute', verifyToken, async (req, res) => {
  try {
    const campaign = await campaignService.executeCampaign(req.params.id);
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get campaign report
router.get('/:id/report', verifyToken, async (req, res) => {
  try {
    const report = await campaignService.generateCampaignReport(req.params.id);
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update campaign
router.put('/:id', verifyToken, validateCampaign, async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('targetSegment');
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete campaign
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Handle SMS status callback
router.post('/:id/sms-status', async (req, res) => {
  try {
    const { MessageSid, MessageStatus } = req.body;
    const result = await smsService.handleSMSStatus(MessageSid, MessageStatus);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start campaign
router.post('/:id/start',
  verifyToken,
  checkPermission('edit_campaign'),
  async (req, res) => {
    try {
      const campaign = await Campaign.findById(req.params.id)
        .populate('segment');

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      if (campaign.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: 'Only draft campaigns can be started'
        });
      }

      // Get customers from segment
      const customers = await Customer.findBySegmentCriteria(campaign.segment.rules);

      // Create communication logs for each customer
      const communicationLogs = customers.map(customer => ({
        campaign: campaign._id,
        customer: customer._id,
        channel: campaign.channel,
        message: campaign.message,
        status: 'pending'
      }));

      await CommunicationLog.insertMany(communicationLogs);

      // Update campaign status
      campaign.status = 'running';
      campaign.startedAt = new Date();
      await campaign.save();

      // Publish to queue for processing
      await publishToQueue('campaign_delivery', {
        campaignId: campaign._id,
        channel: campaign.channel
      });

      res.json({
        success: true,
        message: 'Campaign started successfully',
        data: {
          campaign,
          totalRecipients: customers.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error starting campaign',
        error: error.message
      });
    }
  }
);

// Get campaign statistics
router.get('/:id/stats',
  verifyToken,
  checkPermission('view_campaigns'),
  async (req, res) => {
    try {
      const campaign = await Campaign.findById(req.params.id);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      const stats = await CommunicationLog.getCampaignStats(campaign._id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching campaign statistics',
        error: error.message
      });
    }
  }
);

// Get campaign delivery logs
router.get('/:id/logs',
  verifyToken,
  checkPermission('view_campaigns'),
  queryValidation.pagination,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const logs = await CommunicationLog.findByCampaign(req.params.id)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await CommunicationLog.countDocuments({ campaign: req.params.id });

      res.json({
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching campaign logs',
        error: error.message
      });
    }
  }
);

module.exports = router; 