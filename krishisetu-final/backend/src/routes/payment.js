// In your server.js (backend)
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Instamojo configuration
const INSTAMOJO_API_KEY = process.env.INSTAMOJO_API_KEY || '37393680f8c2f74c4962a7128cd25ad9';
const INSTAMOJO_AUTH_TOKEN = process.env.INSTAMOJO_AUTH_TOKEN || '371fd9a798b0bf71538b6e1a2603dced';
const INSTAMOJO_BASE_URL = 'https://test.instamojo.com/api/1.1/'; // Test environment

// Create payment request endpoint
router.post('/create-instamojo-payment', async (req, res) => {
  try {
    const response = await axios.post(`${INSTAMOJO_BASE_URL}payment-requests/`, req.body, {
      headers: {
        'X-Api-Key': INSTAMOJO_API_KEY,
        'X-Auth-Token': INSTAMOJO_AUTH_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Instamojo error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Payment request failed',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;