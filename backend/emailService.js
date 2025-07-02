const nodemailer = require('nodemailer');
require('dotenv').config();

// Log email configuration for debugging
console.log('Email Configuration:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    user: process.env.SMTP_USER ? '***' + process.env.SMTP_USER.slice(-3) : 'Not set',
    from: process.env.EMAIL_FROM
});

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Send order confirmation email
 * @param {Object} order - Order details
 * @param {string} customerEmail - Customer's email address
 * @returns {Promise} Promise that resolves when email is sent
 */
const sendOrderConfirmation = async (order, customerEmail) => {
    try {
        // Format order items for email
        const orderItems = order.items.map(item => 
            `<tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>₹${(item.quantity * item.price).toFixed(2)}</td>
            </tr>`
        ).join('');

        // Email options
        const mailOptions = {
            from: `"AuIrphila Bakery" <${process.env.EMAIL_FROM}>`,
            to: customerEmail,
            subject: `Order Confirmation - #${order.orderId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #e74c3c;">Thank you for your order!</h2>
                    <p>Dear ${order.customerName},</p>
                    <p>We've received your order and are working on it. Here are your order details:</p>
                    
                    <h3>Order #${order.orderId}</h3>
                    <p><strong>Order Date:</strong> ${new Date().toLocaleString()}</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <thead>
                            <tr style="background-color: #f5f5f5;">
                                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
                                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
                                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
                                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orderItems}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="text-align: right; padding: 10px; border-top: 2px solid #ddd;"><strong>Subtotal:</strong></td>
                                <td style="text-align: right; padding: 10px; border-top: 2px solid #ddd;">₹${order.subtotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="3" style="text-align: right; padding: 10px;"><strong>Tax (5%):</strong></td>
                                <td style="text-align: right; padding: 10px;">₹${order.tax.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="3" style="text-align: right; padding: 10px;"><strong>Delivery:</strong></td>
                                <td style="text-align: right; padding: 10px;">₹${order.delivery.toFixed(2)}</td>
                            </tr>
                            <tr style="font-size: 1.2em; font-weight: bold;">
                                <td colspan="3" style="text-align: right; padding: 15px 10px; border-top: 2px solid #ddd;">Total:</td>
                                <td style="text-align: right; padding: 15px 10px; border-top: 2px solid #ddd;">₹${order.total.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <h3>Delivery Details</h3>
                    <p><strong>Name:</strong> ${order.customerName}</p>
                    <p><strong>Address:</strong> ${order.deliveryAddress}</p>
                    <p><strong>Phone:</strong> ${order.phone}</p>
                    <p><strong>Email:</strong> ${customerEmail}</p>
                    
                    <p>We'll send you another email when your order is on its way.</p>
                    
                    <p>If you have any questions about your order, please reply to this email or call us at +91 1234567890.</p>
                    
                    <p>Thank you for shopping with us!</p>
                    <p>Best regards,<br>The AuIrphila Bakery Team</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777;">
                        <p>AuIrphila Bakery<br>
                        123 Bakery Street, City<br>
                        Phone: +91 1234567890<br>
                        Email: info@auirphilabakery.com</p>
                    </div>
                </div>
            `
        };

        // Send email with detailed logging
        console.log('Sending email to:', customerEmail);
        console.log('Email subject:', mailOptions.subject);
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error response:', error.response);
        console.error('Full error:', error);
        
        // More specific error messages based on common issues
        if (error.code === 'EAUTH') {
            throw new Error('Authentication failed. Please check your email credentials.');
        } else if (error.code === 'ECONNECTION') {
            throw new Error('Could not connect to the email server. Check your internet connection and SMTP settings.');
        } else if (error.code === 'EENVELOPE') {
            throw new Error('Invalid email address. Please check the recipient email address.');
        } else {
            throw new Error(`Failed to send confirmation email: ${error.message}`);
        }
    }
};

module.exports = {
    sendOrderConfirmation
};
