const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Campaign routes
app.get('/api/campaigns', (req, res) => {
  // Mock data for testing
  res.json([
    {
      _id: '1',
      name: 'Summer Sale',
      type: 'promotional',
      channel: 'email',
      status: 'draft',
      goal: 'Increase summer sales',
      targetSegment: 'all',
      messageVariants: ['Get 20% off on summer collection!', 'Summer sale is here!'],
      tags: ['summer', 'sale', 'promotion'],
      createdAt: new Date().toISOString()
    }
  ]);
});

app.post('/api/campaigns', (req, res) => {
  const campaign = {
    _id: Date.now().toString(),
    ...req.body,
    status: 'draft',
    createdAt: new Date().toISOString()
  };
  res.status(201).json(campaign);
});

app.get('/api/campaigns/:id', (req, res) => {
  res.json({
    _id: req.params.id,
    name: 'Summer Sale',
    type: 'promotional',
    channel: 'email',
    status: 'draft',
    goal: 'Increase summer sales',
    targetSegment: 'all',
    messageVariants: ['Get 20% off on summer collection!', 'Summer sale is here!'],
    tags: ['summer', 'sale', 'promotion'],
    createdAt: new Date().toISOString()
  });
});

app.put('/api/campaigns/:id', (req, res) => {
  res.json({
    _id: req.params.id,
    ...req.body,
    updatedAt: new Date().toISOString()
  });
});

app.delete('/api/campaigns/:id', (req, res) => {
  res.status(204).send();
});

app.post('/api/campaigns/:id/start', (req, res) => {
  res.json({
    _id: req.params.id,
    status: 'running',
    startedAt: new Date().toISOString()
  });
});

app.post('/api/campaigns/:id/stop', (req, res) => {
  res.json({
    _id: req.params.id,
    status: 'stopped',
    stoppedAt: new Date().toISOString()
  });
});

app.get('/api/campaigns/:id/stats', (req, res) => {
  res.json({
    totalRecipients: 1000,
    delivered: 950,
    opened: 450,
    clicked: 150,
    deliveryStatus: [
      { status: 'delivered', count: 950 },
      { status: 'failed', count: 50 }
    ],
    aiInsights: [
      {
        title: 'High Open Rate',
        description: 'Your campaign has a 47% open rate, which is above industry average.'
      }
    ],
    bestPerformingVariant: 'Get 20% off on summer collection!',
    optimalSendTime: '10:00 AM',
    averageResponseTime: '2 hours',
    conversionRate: 15
  });
});

// AI routes
app.post('/api/ai/generate-messages', (req, res) => {
  res.json({
    variants: [
      'Get 20% off on summer collection!',
      'Summer sale is here!',
      'Don\'t miss our summer deals!'
    ]
  });
});

app.post('/api/ai/generate-tags', (req, res) => {
  res.json({
    tags: ['summer', 'sale', 'promotion', 'discount']
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 