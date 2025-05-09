import api from './api';

// Generate message variants for a campaign
export const generateMessageVariants = async (goal, segment) => {
  try {
    const response = await api.post('/ai/generate-messages', {
      goal,
      segment
    });
    return response.data.variants;
  } catch (error) {
    throw new Error('Failed to generate message variants');
  }
};

// Generate campaign insights
export const generateCampaignInsights = async (campaignId) => {
  try {
    const response = await api.get(`/ai/campaign-insights/${campaignId}`);
    return response.data.insights;
  } catch (error) {
    throw new Error('Failed to generate campaign insights');
  }
};

// Convert natural language to segment rules
export const convertToSegmentRules = async (description) => {
  try {
    const response = await api.post('/ai/convert-segment', {
      description
    });
    return response.data.rules;
  } catch (error) {
    throw new Error('Failed to convert segment description to rules');
  }
};

// Generate lookalike segment
export const generateLookalikeSegment = async (segmentId) => {
  try {
    const response = await api.post(`/ai/lookalike-segment/${segmentId}`);
    return response.data.segment;
  } catch (error) {
    throw new Error('Failed to generate lookalike segment');
  }
};

// Predict optimal send time
export const predictSendTime = async (customerData, campaignType) => {
  try {
    const response = await api.post('/ai/predict-send-time', {
      customerData,
      campaignType
    });
    return response.data.optimalTime;
  } catch (error) {
    throw new Error('Failed to predict optimal send time');
  }
};

// Generate campaign tags
export const generateCampaignTags = async (campaignData) => {
  try {
    const response = await api.post('/ai/generate-tags', campaignData);
    return response.data.tags;
  } catch (error) {
    throw new Error('Failed to generate campaign tags');
  }
};

// Analyze campaign performance
export const analyzeCampaignPerformance = async (campaignId) => {
  try {
    const response = await api.get(`/ai/analyze-performance/${campaignId}`);
    return response.data.analysis;
  } catch (error) {
    throw new Error('Failed to analyze campaign performance');
  }
};

// Generate A/B test recommendations
export const generateABTestRecommendations = async (campaignId) => {
  try {
    const response = await api.get(`/ai/ab-test-recommendations/${campaignId}`);
    return response.data.recommendations;
  } catch (error) {
    throw new Error('Failed to generate A/B test recommendations');
  }
};

// Generate customer journey insights
export const generateCustomerJourneyInsights = async (customerId) => {
  try {
    const response = await api.get(`/ai/customer-journey/${customerId}`);
    return response.data.insights;
  } catch (error) {
    throw new Error('Failed to generate customer journey insights');
  }
};

// Generate personalized content
export const generatePersonalizedContent = async (customerData, campaignType) => {
  try {
    const response = await api.post('/ai/personalize-content', {
      customerData,
      campaignType
    });
    return response.data.content;
  } catch (error) {
    throw new Error('Failed to generate personalized content');
  }
};

// Generate campaign summary
export const generateCampaignSummary = async (campaignId) => {
  try {
    const response = await api.get(`/ai/campaign-summary/${campaignId}`);
    return response.data.summary;
  } catch (error) {
    throw new Error('Failed to generate campaign summary');
  }
}; 