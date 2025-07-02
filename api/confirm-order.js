// Vercel API route for order confirmation emails
const nodemailer = require('nodemailer');

// Enable CORS headers
const enableCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  return await fn(req, res);
};

// Generate HTML email template for order confirmation
function generateOrderConfirmationEmail(orderData) {
  const { fullName, email, phone, addressLine1, addressLine2, city, state, postalCode, items, subtotal, tax, total, orderNumber } = orderData;
  
  // Format items for email display
  const itemsList = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background-color: #f8a100; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 10px; background-color: #f5f5f5; }
        .total-row { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Thank You for Your Order!</h1>
        <p>Order #${orderNumber || 'Processing'}</p>
      </div>
      
      <div class="content">
        <h2>Hello ${fullName},</h2>
        <p>We're excited to confirm your order with AuIrphila Bakery. Below are your order details:</p>
        
        <h3>Order Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right; padding: 10px;">Subtotal:</td>
              <td style="text-align: right; padding: 10px;">₹${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right; padding: 10px;">Tax:</td>
              <td style="text-align: right; padding: 10px;">₹${tax.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="text-align: right; padding: 10px; font-weight: bold;">Total:</td>
              <td style="text-align: right; padding: 10px; font-weight: bold;">₹${total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <h3>Delivery Information</h3>
        <p>
          ${fullName}<br>
          ${addressLine1}<br>
          ${addressLine2 ? addressLine2 + '<br>' : ''}
          ${city}, ${state} ${postalCode}<br>
          Phone: ${phone}<br>
          Email: ${email}
        </p>
        
        <p>We'll notify you when your order is ready. If you have any questions, please contact us.</p>
        
        <p>Thank you for choosing AuIrphila Bakery!</p>
      </div>
      
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} AuIrphila Bakery. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const orderData = req.body;
    console.log('Received order confirmation request:', orderData);
    
    // Create a test order ID if none provided (for testing)
    const orderId = orderData.orderNumber || `TEST-${Date.now()}`;
    const customerEmail = orderData.email;

    if (!orderId || !customerEmail) {
      throw new Error('Missing required order information');
    }
    
    // Generate enhanced HTML email using our template
    const enhancedHtml = generateOrderConfirmationEmail(orderData);
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'auirphilabakery@gmail.com',
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false // Only for development
      }
    });
    
    // Send email
    const mailOptions = {
      from: `"AuIrphila Bakery" <${process.env.EMAIL_FROM || 'auirphilabakery@gmail.com'}>`,
      to: customerEmail,
      subject: `Order Confirmation - Order #${orderId}`,
      html: enhancedHtml
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Enhanced order confirmation email sent to:', customerEmail);
    
    return res.status(200).json({ message: 'Order confirmed and enhanced email sent.' });
  } catch (err) {
    console.error('Error sending order confirmation:', err);
    return res.status(500).json({ message: 'Order confirmed but email failed.', error: err.message });
  }
};

module.exports = enableCors(handler);
