const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { verifyToken, checkPermission } = require('../middleware/auth');
const { customerValidation, queryValidation } = require('../middleware/validation');

// Get all customers with pagination
router.get('/',
  verifyToken,
  checkPermission('view_customers'),
  queryValidation.pagination,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const customers = await Customer.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Customer.countDocuments();

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
        message: 'Error fetching customers',
        error: error.message
      });
    }
  }
);

// Get customer by ID
router.get('/:id',
  verifyToken,
  checkPermission('view_customers'),
  async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching customer',
        error: error.message
      });
    }
  }
);

// Create new customer
router.post('/',
  verifyToken,
  checkPermission('create_customer'),
  customerValidation.create,
  async (req, res) => {
    try {
      const customer = new Customer(req.body);
      await customer.save();

      res.status(201).json({
        success: true,
        data: customer
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating customer',
        error: error.message
      });
    }
  }
);

// Update customer
router.put('/:id',
  verifyToken,
  checkPermission('edit_customer'),
  customerValidation.update,
  async (req, res) => {
    try {
      const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error updating customer',
        error: error.message
      });
    }
  }
);

// Delete customer
router.delete('/:id',
  verifyToken,
  checkPermission('delete_customer'),
  async (req, res) => {
    try {
      const customer = await Customer.findByIdAndDelete(req.params.id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      res.json({
        success: true,
        message: 'Customer deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting customer',
        error: error.message
      });
    }
  }
);

// Search customers
router.get('/search',
  verifyToken,
  checkPermission('view_customers'),
  async (req, res) => {
    try {
      const { query } = req.query;
      const searchQuery = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } }
        ]
      };

      const customers = await Customer.find(searchQuery)
        .limit(10)
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: customers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error searching customers',
        error: error.message
      });
    }
  }
);

module.exports = router; 