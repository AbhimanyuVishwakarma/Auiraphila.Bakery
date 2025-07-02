// Load environment variables first
require('dotenv').config({ path: './.env' });

// Debug: Log environment variables
console.log('Environment Variables:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_SECURE:', process.env.SMTP_SECURE);
console.log('SMTP_USER:', process.env.SMTP_USER ? '***' + process.env.SMTP_USER.slice(-3) : 'Not set');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

const nodemailer = require('nodemailer');

// Create test email
const sendTestEmail = async () => {
    try {
        console.log('\nCreating transporter...');
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            debug: true, // Enable debug output
            logger: true // Log to console
        });

        console.log('\nSending test email...');
        const info = await transporter.sendMail({
            from: `"Test Sender" <${process.env.EMAIL_FROM}>`,
            to: process.env.EMAIL_FROM, // Send to yourself for testing
            subject: 'Test Email from AuIrphila Bakery',
            text: 'This is a test email from AuIrphila Bakery',
            html: '<h1>Test Email</h1><p>This is a test email from AuIrphila Bakery</p>'
        });

        console.log('\nEmail sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        
    } catch (error) {
        console.error('\nError sending email:');
        console.error('Error name:', error.name);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error response:', error.response);
        console.error('Full error:', error);
    }
};

// Run the test
sendTestEmail();
