const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

// Convert natural language to segment rules
const naturalLanguageToRules = async (description) => {
  try {
    const prompt = `Convert the following customer segment description into a set of rules:
    Description: ${description}
    
    Rules should be in the following format:
    {
      "rules": [
        {
          "field": "totalSpent|lastOrderDate|tags|city|country",
          "operator": "equals|notEquals|contains|notContains|greaterThan|lessThan|between",
          "value": "value",
          "value2": "value2 (only for between operator)"
        }
      ],
      "ruleOperator": "AND|OR"
    }`;

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 500,
      temperature: 0.3
    });

    const rules = JSON.parse(response.data.choices[0].text.trim());
    return rules;
  } catch (error) {
    throw new Error('Error converting natural language to rules: ' + error.message);
  }
};

// Generate campaign message variants
const generateMessageVariants = async (campaignGoal, customerSegment) => {
  try {
    const prompt = `Generate 3 promotional message variants for the following campaign:
    Goal: ${campaignGoal}
    Target Segment: ${customerSegment}
    
    Each message should include:
    1. Subject line
    2. Body text (max 200 words)
    3. Call to action
    
    Format the response as a JSON array of messages.`;

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 1000,
      temperature: 0.7
    });

    const messages = JSON.parse(response.data.choices[0].text.trim());
    return messages;
  } catch (error) {
    throw new Error('Error generating message variants: ' + error.message);
  }
};

// Generate campaign summary
const generateCampaignSummary = async (campaignStats) => {
  try {
    const prompt = `Generate a natural language summary of the following campaign statistics:
    ${JSON.stringify(campaignStats, null, 2)}
    
    Include:
    1. Overall performance
    2. Key metrics
    3. Notable patterns or insights
    4. Recommendations for improvement`;

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 500,
      temperature: 0.5
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    throw new Error('Error generating campaign summary: ' + error.message);
  }
};

// Predict optimal send time
const predictSendTime = async (customerData, campaignType) => {
  try {
    const prompt = `Based on the following customer data and campaign type, predict the optimal send time:
    Customer Data: ${JSON.stringify(customerData, null, 2)}
    Campaign Type: ${campaignType}
    
    Consider:
    1. Customer's timezone
    2. Historical engagement patterns
    3. Campaign type and urgency
    4. Industry best practices`;

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 300,
      temperature: 0.3
    });

    const prediction = JSON.parse(response.data.choices[0].text.trim());
    return prediction;
  } catch (error) {
    throw new Error('Error predicting send time: ' + error.message);
  }
};

// Generate lookalike segment
const generateLookalikeSegment = async (sourceSegment, customerData) => {
  try {
    const prompt = `Generate a lookalike segment based on the following source segment and customer data:
    Source Segment: ${JSON.stringify(sourceSegment, null, 2)}
    Customer Data: ${JSON.stringify(customerData, null, 2)}
    
    Identify:
    1. Common characteristics
    2. Behavioral patterns
    3. Demographic similarities
    4. Purchase patterns`;

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 500,
      temperature: 0.4
    });

    const lookalikeRules = JSON.parse(response.data.choices[0].text.trim());
    return lookalikeRules;
  } catch (error) {
    throw new Error('Error generating lookalike segment: ' + error.message);
  }
};

// Auto-tag campaign
const autoTagCampaign = async (campaignData) => {
  try {
    const prompt = `Analyze the following campaign data and generate relevant tags:
    ${JSON.stringify(campaignData, null, 2)}
    
    Consider:
    1. Campaign objective
    2. Target audience
    3. Message content
    4. Timing and seasonality
    5. Industry context`;

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 300,
      temperature: 0.3
    });

    const tags = JSON.parse(response.data.choices[0].text.trim());
    return tags;
  } catch (error) {
    throw new Error('Error auto-tagging campaign: ' + error.message);
  }
};

module.exports = {
  naturalLanguageToRules,
  generateMessageVariants,
  generateCampaignSummary,
  predictSendTime,
  generateLookalikeSegment,
  autoTagCampaign
}; 