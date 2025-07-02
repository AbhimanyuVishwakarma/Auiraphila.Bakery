const nodemailer = require('nodemailer');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_FROM,  // Use SMTP_USER from .env file
    pass: process.env.SMTP_PASS,                           // Use SMTP_PASS from .env file
  },
  tls: {
    rejectUnauthorized: false // Only for development
  }
});

// Verify the connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send messages');
  }
});

module.exports = transporter;