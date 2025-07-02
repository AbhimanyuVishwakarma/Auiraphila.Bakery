// Load environment variables
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(cors({
  origin: '*', // In production, you should restrict this to your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

// Handle order confirmation (email sending)
app.post('/confirm-order', async (req, res) => {
  const orderData = req.body;
  console.log('Received order confirmation request:', orderData);
  
  // Create a test order ID if none provided (for testing)
  const orderId = orderData.orderNumber || `TEST-${Date.now()}`;
  const customerEmail = orderData.email;

  try {
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
    
    return res.status(200).json({ 
      success: true,
      message: 'Order confirmed and enhanced email sent.' 
    });
  } catch (err) {
    console.error('Error sending order confirmation:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Order confirmed but email failed.', 
      error: err.message 
    });
  }
});

// New endpoint to save orders to database (using JWT auth)
app.post('/save-order', async (req, res) => {
  try {
    console.log('Received order save request:', req.body);
    
    // Get the JWT token from the request headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const token = authHeader.split(' ')[1];
    console.log('Using JWT token for authentication');
    
    // Initialize Supabase with anon key and JWT token
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Missing Supabase credentials'
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
    
    // Format the order data
    const formattedOrder = {
      user_id: req.body.user_id, // Add user_id from frontend
      user_email: req.body.email,
      full_name: req.body.fullName,
      mobile_number: req.body.phone,
      address_line1: req.body.addressLine1,
      address_line2: req.body.addressLine2 || '',
      city: req.body.city,
      state: req.body.state,
      postal_code: req.body.postalCode,
      items: req.body.items,
      subtotal: req.body.subtotal,
      tax: req.body.tax,
      total: req.body.total,
      payment_method: req.body.paymentMethod || 'COD',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert the order into the database
    const { data, error } = await supabase
      .from('orders')
      .insert([formattedOrder])
      .select();
    
    if (error) {
      console.error('Database error saving order:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error saving order',
        error: error.message
      });
    }
    
    if (!data || data.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'No data returned after order insertion'
      });
    }
    
    // Generate order display ID
    const { id, order_number } = data[0];
    const order_display_id = `ORD-${new Date().getFullYear()}-${order_number}`;
    
    // Update the order with display ID
    const { data: updateData, error: updateError } = await supabase
      .from('orders')
      .update({
        order_display_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (updateError) {
      console.warn('Warning: Could not update order display ID:', updateError);
    }
    
    // Return success with order info
    res.status(200).json({
      success: true,
      message: 'Order saved successfully',
      id,
      order_number,
      order_display_id
    });
    
  } catch (err) {
    console.error('Server error saving order:', err);
    res.status(500).json({
      success: false,
      message: 'Server error processing order',
      error: err.message
    });
  }
});

// Handle signup endpoint
app.post('/signup', async (req, res) => {
  try {
    const { fullname, email } = req.body;
    
    if (!fullname || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name and email are required' 
      });
    }

    console.log('New signup:', { fullname, email });

    // Email configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false // Only for development
      }
    });

    // Send welcome email
    const mailOptions = {
      from: `"AuIrphila Bakery" <${process.env.EMAIL_FROM || 'noreply@auirphila-bakery.com'}>`,
      to: email,
      subject: 'Welcome to AuIrphila Bakery!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to AuIrphila Bakery, ${fullname}!</h2>
          <p>Thank you for signing up. We're excited to have you as part of our bakery family!</p>
          <p>Get ready to explore our delicious range of baked goods and enjoy exclusive offers.</p>
          <p>Happy baking,<br>The AuIrphila Bakery Team</p>
        </div>
      `
    };

    // Send welcome email to user
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
    
    res.status(200).json({ 
      success: true, 
      message: 'Signup successful! Please check your email.' 
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process signup. Please try again later.' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// Start the server with enhanced error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=== AuIrphila Bakery API Server ===`);
  console.log(`Server is running on port: ${PORT}`);
  console.log(`\nAPI endpoints available at:`);
  console.log(`http://localhost:${PORT}/health`);
  console.log(`http://localhost:${PORT}/save-order`);
  console.log(`http://localhost:${PORT}/confirm-order`);
  console.log(`http://localhost:${PORT}/signup`);
  console.log('\nPress Ctrl+C to stop the server');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\nError: Port ${PORT} is already in use.`);
    console.log('Please close any other running servers or use a different port.');
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server has been terminated.');
    process.exit(0);
  });
});
