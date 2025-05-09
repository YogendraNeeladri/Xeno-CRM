const { body, param, query, validationResult } = require('express-validator');
const Joi = require('joi');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Customer validation rules
const customerValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim().isMobilePhone().withMessage('Valid phone number is required'),
    body('address').optional().isObject().withMessage('Address must be an object'),
    body('address.street').optional().trim().notEmpty().withMessage('Street is required'),
    body('address.city').optional().trim().notEmpty().withMessage('City is required'),
    body('address.state').optional().trim().notEmpty().withMessage('State is required'),
    body('address.country').optional().trim().notEmpty().withMessage('Country is required'),
    body('address.zipCode').optional().trim().notEmpty().withMessage('Zip code is required'),
    validate
  ],
  update: [
    param('id').isMongoId().withMessage('Valid customer ID is required'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().trim().isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim().isMobilePhone().withMessage('Valid phone number is required'),
    validate
  ]
};

// Order validation rules
const orderValidation = {
  create: [
    body('customer').isMongoId().withMessage('Valid customer ID is required'),
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.name').trim().notEmpty().withMessage('Item name is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('paymentMethod').isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer'])
      .withMessage('Valid payment method is required'),
    validate
  ],
  update: [
    param('id').isMongoId().withMessage('Valid order ID is required'),
    body('status').optional()
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Valid status is required'),
    body('paymentStatus').optional()
      .isIn(['pending', 'paid', 'failed', 'refunded'])
      .withMessage('Valid payment status is required'),
    validate
  ]
};

// Segment validation rules
const segmentValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Segment name is required'),
    body('rules').isArray().withMessage('Rules must be an array'),
    body('rules.*.field').isIn(['totalSpent', 'lastOrderDate', 'tags', 'city', 'country'])
      .withMessage('Valid field is required'),
    body('rules.*.operator').isIn(['equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'lessThan', 'between'])
      .withMessage('Valid operator is required'),
    body('rules.*.value').notEmpty().withMessage('Value is required'),
    body('ruleOperator').optional().isIn(['AND', 'OR']).withMessage('Valid rule operator is required'),
    validate
  ],
  update: [
    param('id').isMongoId().withMessage('Valid segment ID is required'),
    body('name').optional().trim().notEmpty().withMessage('Segment name cannot be empty'),
    body('rules').optional().isArray().withMessage('Rules must be an array'),
    validate
  ]
};

// Campaign validation schema
const campaignSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().max(500),
  goal: Joi.string().required(),
  targetSegment: Joi.string().required(),
  channel: Joi.string().valid('email', 'sms').required(),
  type: Joi.string().valid('promotional', 'transactional', 'newsletter').required(),
  status: Joi.string().valid('draft', 'scheduled', 'running', 'completed', 'failed'),
  schedule: Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    deliveries: Joi.array().items(
      Joi.object({
        customerId: Joi.string(),
        scheduledTime: Joi.date().iso(),
        status: Joi.string().valid('scheduled', 'delivered', 'failed'),
        deliveredAt: Joi.date().iso()
      })
    )
  }),
  messageVariants: Joi.array().items(
    Joi.object({
      subject: Joi.string().max(100),
      body: Joi.string().max(1000),
      tags: Joi.array().items(Joi.string())
    })
  ),
  tags: Joi.array().items(Joi.string())
});

// Schedule validation schema
const scheduleSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
});

// Campaign query validation schema
const campaignQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('createdAt', 'name', 'status', 'type').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  status: Joi.string().valid('draft', 'scheduled', 'running', 'completed', 'failed'),
  type: Joi.string().valid('promotional', 'transactional', 'newsletter'),
  channel: Joi.string().valid('email', 'sms'),
  search: Joi.string().max(100)
});

// Validate campaign data
const validateCampaign = (req, res, next) => {
  const { error } = campaignSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  next();
};

// Validate schedule data
const validateSchedule = (req, res, next) => {
  const { error } = scheduleSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  next();
};

// Validate campaign query parameters
const validateCampaignQuery = (req, res, next) => {
  const { error } = campaignQuerySchema.validate(req.query, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  next();
};

module.exports = {
  customerValidation,
  orderValidation,
  segmentValidation,
  validateCampaign,
  validateSchedule,
  validateCampaignQuery
}; 