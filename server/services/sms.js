const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send SMS
const sendSMS = async ({ to, message, campaignId }) => {
  try {
    const result = await client.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.API_BASE_URL}/api/campaigns/${campaignId}/sms-status`
    });

    return {
      success: true,
      messageId: result.sid
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify SMS configuration
const verifySMSConfig = async () => {
  try {
    // Test the Twilio credentials by making a simple API call
    await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    return {
      success: true,
      message: 'SMS configuration is valid'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Handle SMS status callback
const handleSMSStatus = async (messageId, status) => {
  try {
    // Update communication log with SMS status
    await CommunicationLog.findOneAndUpdate(
      { 'message.messageId': messageId },
      { 
        status: status === 'delivered' ? 'sent' : 'failed',
        updatedAt: new Date()
      }
    );

    return {
      success: true,
      message: 'SMS status updated'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendSMS,
  verifySMSConfig,
  handleSMSStatus
}; 