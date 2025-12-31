const axios = require('axios');

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

async function createOrder(items) {
  try {
    const response = await axios.post(`${BASE_URL}/api/orders`, { items });
    console.log(`Order created: #${response.data.orderNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error.message);
  }
}

async function analyzeKitchen() {
  try {
    const response = await axios.get(`${BASE_URL}/api/kitchen/analyze`);
    console.log('Kitchen analysis triggered:', response.data.alerts.length, 'alerts');
    return response.data;
  } catch (error) {
    console.error('Error analyzing kitchen:', error.message);
  }
}

async function run() {
  console.log('Starting traffic generator...');

  // 1. Create some normal orders
  await createOrder([{ name: 'Gemini Burger', quantity: 2, price: 12.99 }]);
  await createOrder([{ name: 'Asteroid Fries', quantity: 1, price: 4.99 }]);

  // 2. Trigger analysis
  await analyzeKitchen();

  // 3. Simulate high load
  console.log('Simulating high load...');
  for (let i = 0; i < 5; i++) {
    await createOrder([{ name: 'Supernova Shake', quantity: 3, price: 6.99 }]);
  }
  await analyzeKitchen();

  // 4. Simulate some errors (if we had an endpoint that could fail)
  // For now, we'll just hit the analyze endpoint repeatedly
  console.log('Simulating repeated analysis...');
  for (let i = 0; i < 10; i++) {
    await analyzeKitchen();
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('Traffic generation complete.');
}

run();
