const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { verifyToken, checkPermission } = require('../middleware/auth');
const { orderValidation, queryValidation } = require('../middleware/validation');

// Get all orders with pagination
router.get('/',
  verifyToken,
  checkPermission('view_orders'),
  queryValidation.pagination,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const orders = await Order.find()
        .populate('customer', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Order.countDocuments();

      res.json({
        success: true,
        data: orders,
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
        message: 'Error fetching orders',
        error: error.message
      });
    }
  }
);

// Get order by ID
router.get('/:id',
  verifyToken,
  checkPermission('view_orders'),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate('customer', 'name email phone address');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching order',
        error: error.message
      });
    }
  }
);

// Create new order
router.post('/',
  verifyToken,
  checkPermission('create_order'),
  orderValidation.create,
  async (req, res) => {
    try {
      // Check if customer exists
      const customer = await Customer.findById(req.body.customer);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const order = new Order(req.body);
      await order.save();

      // Update customer's total spent
      await customer.updateTotalSpent(order.totalAmount);

      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating order',
        error: error.message
      });
    }
  }
);

// Update order
router.put('/:id',
  verifyToken,
  checkPermission('edit_order'),
  orderValidation.update,
  async (req, res) => {
    try {
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('customer');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating order',
        error: error.message
      });
    }
  }
);

// Delete order
router.delete('/:id',
  verifyToken,
  checkPermission('delete_order'),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Update customer's total spent
      const customer = await Customer.findById(order.customer);
      if (customer) {
        customer.totalSpent -= order.totalAmount;
        await customer.save();
      }

      await order.remove();

      res.json({
        success: true,
        message: 'Order deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting order',
        error: error.message
      });
    }
  }
);

// Get orders by customer
router.get('/customer/:customerId',
  verifyToken,
  checkPermission('view_orders'),
  queryValidation.pagination,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const orders = await Order.find({ customer: req.params.customerId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Order.countDocuments({ customer: req.params.customerId });

      res.json({
        success: true,
        data: orders,
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
        message: 'Error fetching customer orders',
        error: error.message
      });
    }
  }
);

// Get orders by date range
router.get('/date-range',
  verifyToken,
  checkPermission('view_orders'),
  queryValidation.dateRange,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const orders = await Order.findByDateRange(
        new Date(startDate),
        new Date(endDate)
      );

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching orders by date range',
        error: error.message
      });
    }
  }
);

module.exports = router; 