const express = require('express');
const router = express.Router();
const Segment = require('../models/Segment');
const Customer = require('../models/Customer');
const { verifyToken, checkPermission } = require('../middleware/auth');
const { segmentValidation, queryValidation } = require('../middleware/validation');

// Get all segments with pagination
router.get('/',
  verifyToken,
  checkPermission('view_segments'),
  queryValidation.pagination,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const segments = await Segment.find()
        .populate('createdBy', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Segment.countDocuments();

      res.json({
        success: true,
        data: segments,
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
        message: 'Error fetching segments',
        error: error.message
      });
    }
  }
);

// Get segment by ID
router.get('/:id',
  verifyToken,
  checkPermission('view_segments'),
  async (req, res) => {
    try {
      const segment = await Segment.findById(req.params.id)
        .populate('createdBy', 'name email');

      if (!segment) {
        return res.status(404).json({
          success: false,
          message: 'Segment not found'
        });
      }

      res.json({
        success: true,
        data: segment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching segment',
        error: error.message
      });
    }
  }
);

// Create new segment
router.post('/',
  verifyToken,
  checkPermission('create_segment'),
  segmentValidation.create,
  async (req, res) => {
    try {
      const segment = new Segment({
        ...req.body,
        createdBy: req.user._id
      });

      // Update customer count
      await segment.updateCustomerCount();

      await segment.save();

      res.status(201).json({
        success: true,
        data: segment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating segment',
        error: error.message
      });
    }
  }
);

// Update segment
router.put('/:id',
  verifyToken,
  checkPermission('edit_segment'),
  segmentValidation.update,
  async (req, res) => {
    try {
      const segment = await Segment.findById(req.params.id);

      if (!segment) {
        return res.status(404).json({
          success: false,
          message: 'Segment not found'
        });
      }

      // Update segment fields
      Object.assign(segment, req.body);
      segment.lastUpdated = new Date();

      // Update customer count
      await segment.updateCustomerCount();

      await segment.save();

      res.json({
        success: true,
        data: segment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating segment',
        error: error.message
      });
    }
  }
);

// Delete segment
router.delete('/:id',
  verifyToken,
  checkPermission('delete_segment'),
  async (req, res) => {
    try {
      const segment = await Segment.findByIdAndDelete(req.params.id);

      if (!segment) {
        return res.status(404).json({
          success: false,
          message: 'Segment not found'
        });
      }

      res.json({
        success: true,
        message: 'Segment deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting segment',
        error: error.message
      });
    }
  }
);

// Get segment preview (list of customers)
router.get('/:id/preview',
  verifyToken,
  checkPermission('view_segments'),
  queryValidation.pagination,
  async (req, res) => {
    try {
      const segment = await Segment.findById(req.params.id);

      if (!segment) {
        return res.status(404).json({
          success: false,
          message: 'Segment not found'
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const customers = await Customer.findBySegmentCriteria(segment.rules)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Customer.countDocuments(segment.rules);

      res.json({
        success: true,
        data: customers,
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
        message: 'Error fetching segment preview',
        error: error.message
      });
    }
  }
);

// Get segment statistics
router.get('/:id/stats',
  verifyToken,
  checkPermission('view_segments'),
  async (req, res) => {
    try {
      const segment = await Segment.findById(req.params.id);

      if (!segment) {
        return res.status(404).json({
          success: false,
          message: 'Segment not found'
        });
      }

      const customers = await Customer.findBySegmentCriteria(segment.rules);

      const stats = {
        totalCustomers: customers.length,
        averageSpent: customers.reduce((acc, c) => acc + c.totalSpent, 0) / customers.length || 0,
        lastOrderDistribution: {
          '0-30': customers.filter(c => c.daysSinceLastOrder <= 30).length,
          '31-60': customers.filter(c => c.daysSinceLastOrder > 30 && c.daysSinceLastOrder <= 60).length,
          '61-90': customers.filter(c => c.daysSinceLastOrder > 60 && c.daysSinceLastOrder <= 90).length,
          '90+': customers.filter(c => c.daysSinceLastOrder > 90).length
        }
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching segment statistics',
        error: error.message
      });
    }
  }
);

module.exports = router; 