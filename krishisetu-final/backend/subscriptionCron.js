const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment');

// Test time - 8:20 PM (will change to 7 AM later)
const PROCESS_TIME = '20 20 * * *'; // 8:20 PM
// const PROCESS_TIME = '0 7 * * *'; // For production (7 AM)

// Daily Subscription Processing
cron.schedule(PROCESS_TIME, async () => {
  console.log('Running daily subscription processing...');
  try {
    await processSubscriptions('Daily');
    console.log('Daily subscriptions processed successfully');
  } catch (error) {
    console.error('Error processing daily subscriptions:', error);
  }
});

// Alternate Days Subscription Processing
cron.schedule(PROCESS_TIME, async () => {
  const today = new Date();
  const dayOfMonth = today.getDate();
  
  // Get all alternate day subscriptions to check their start dates
  const subscriptions = await queryDatabase(
    `SELECT subscription_id, start_date 
     FROM subscriptions 
     WHERE subscription_type = 'Alternate Days' 
     AND status = 'Active'`
  );

  // Process only if today matches the subscription pattern based on start date
  for (const sub of subscriptions) {
    const startDate = new Date(sub.start_date);
    const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff % 2 === 0) { // Every 2nd day from start date
      try {
        await processSubscriptions('Alternate Days');
        console.log('Alternate day subscriptions processed successfully');
      } catch (error) {
        console.error('Error processing alternate day subscriptions:', error);
      }
      break; // Process once for all matching subscriptions
    }
  }
});

// Weekly Subscription Processing
cron.schedule(PROCESS_TIME, async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all weekly subscriptions to check their start dates
  const subscriptions = await queryDatabase(
    `SELECT subscription_id, start_date 
     FROM subscriptions 
     WHERE subscription_type = 'Weekly' 
     AND status = 'Active'`
  );

  // Process only if today is exactly 7 days from start date
  for (const sub of subscriptions) {
    const startDate = new Date(sub.start_date);
    const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff % 7 === 0) { // Every 7 days from start date
      try {
        await processSubscriptions('Weekly');
        console.log('Weekly subscriptions processed successfully');
      } catch (error) {
        console.error('Error processing weekly subscriptions:', error);
      }
      break; // Process once for all matching subscriptions
    }
  }
});

// Monthly Subscription Processing
cron.schedule(PROCESS_TIME, async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all monthly subscriptions to check their start dates
  const subscriptions = await queryDatabase(
    `SELECT subscription_id, start_date 
     FROM subscriptions 
     WHERE subscription_type = 'Monthly' 
     AND status = 'Active'`
  );

  // Process only if today is same date as start date (monthly)
  for (const sub of subscriptions) {
    const startDate = new Date(sub.start_date);
    
    if (today.getDate() === startDate.getDate()) { // Same date each month
      try {
        await processSubscriptions('Monthly');
        console.log('Monthly subscriptions processed successfully');
      } catch (error) {
        console.error('Error processing monthly subscriptions:', error);
      }
      break; // Process once for all matching subscriptions
    }
  }
});

async function processSubscriptions(type) {
  try {
    const endpoint = type.toLowerCase().replace(' ', '-');
    const response = await axios.post(
      `http://localhost:5000/api/process-subscriptions/${endpoint}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CRON_SECRET}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Manual trigger for testing (optional)
async function manualProcess(type) {
  console.log(`Manually processing ${type} subscriptions...`);
  await processSubscriptions(type);
}

module.exports = { manualProcess };