const { sendOrderConfirmation } = require('./backend/emailService');

// Test order data
const testOrder = {
    orderId: 'TEST' + Date.now().toString().slice(-6),
    customerName: 'Test Customer',
    deliveryAddress: '123 Test St, Test City',
    phone: '+91 9876543210',
    items: [
        { id: 1, name: 'Chocolate Cake', quantity: 2, price: 350 },
        { id: 2, name: 'Vanilla Muffin', quantity: 3, price: 50 }
    ],
    subtotal: 850,
    tax: 42.50,
    delivery: 50,
    total: 942.50,
    orderDate: new Date().toISOString()
};

require('dotenv').config({ path: './.env' });

// Use the email from environment variables or default to a test email
const testEmail = process.env.EMAIL_FROM || 'test@example.com';

console.log('Starting email test...');
console.log('Sending test email to:', testEmail);

sendOrderConfirmation(testOrder, testEmail)
    .then(result => {
        console.log('Email sent successfully!', result);
        process.exit(0);
    })
    .catch(error => {
        console.error('Failed to send email:');
        console.error(error);
        process.exit(1);
    });
