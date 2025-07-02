// Load environment variables
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

// Import required modules
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sendOrderConfirmation } = require('./emailService');
const sendOrderConfirmationEmail = require('./sendMail');
const { generateOrderConfirmationEmail } = require('./emailTemplate');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Clear the console
console.clear();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..'), {
    index: false,
    setHeaders: (res, path) => {
        // Set proper MIME types for CSS files
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Serve the root index.html for the main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Serve other HTML files from the root
app.get('/*.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', req.path));
});

// Handle pages in the pages directory
app.get('/pages/:page', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'pages', `${req.params.page}.html`));
});

// Simple health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle order confirmation (new route for Nodemailer)
app.post('/api/confirm-order', async (req, res) => {
  const orderData = req.body;
  console.log('Received order confirmation request:', orderData);
  
  // Create a test order ID if none provided (for testing)
  const orderId = orderData.orderNumber || `TEST-${Date.now()}`;
  const customerEmail = orderData.email;

  try {
    // For testing, we can bypass the database lookup
    if (!orderId || !customerEmail) {
      throw new Error('Missing required order information');
    }
    
    // Generate enhanced HTML email using our template
    const enhancedHtml = generateOrderConfirmationEmail(orderData);
    
    // Send email directly without database lookup for testing
    const mailOptions = {
      from: `"AuIrphila Bakery" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Order Confirmation - Order #${orderId}`,
      html: enhancedHtml
    };
    
    // Get the transporter
    const nodemailer = require('nodemailer');
    const transporter = require('./mailer');
    
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Enhanced order confirmation email sent to:', customerEmail);
    
    res.status(200).json({ message: 'Order confirmed and enhanced email sent.' });
  } catch (err) {
    console.error('Error sending order confirmation:', err);
    res.status(500).json({ message: 'Order confirmed but email failed.', error: err.message });
  }
});

// New endpoint to save orders to database (using JWT auth)
app.post('/api/save-order', async (req, res) => {
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
    
    // Require the Supabase client
    const { createClient } = require('@supabase/supabase-js');
    
    // Initialize Supabase with anon key and JWT token
    const supabaseUrl = 'https://ytjpbnkksgawikffgtfb.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0anBibmtrc2dhd2lrZmZndGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NDY5NzcsImV4cCI6MjA2NjMyMjk3N30.k_JUe3Uag5AizMl5B-OJ7oRYKuCEzL9xIG98h_3SmTc';
    
    console.log('Initializing Supabase client with URL:', supabaseUrl);
    
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
      zip_code: req.body.zipCode,
      country: req.body.country || 'India',
      order_items: req.body.items,
      total_bill: req.body.totalAmount,
      payment_method: req.body.paymentMethod,
      created_at: new Date().toISOString()
    };
    
    // Log the user_id for debugging
    console.log('Order user_id:', req.body.user_id);
    
    // Insert the order
    const { data, error } = await supabase
      .from('orders')
      .insert([formattedOrder])
      .select('id, order_number');
      
    if (error) {
      console.error('Error saving order to database:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save order',
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
      .select('id, order_number, order_display_id');
      
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

// Handle signup endpoint (you can keep your existing signup endpoint)
app.post('/api/signup', async (req, res) => {
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

// Serve the main HTML file for any other GET request
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
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
    console.log(`\n=== AuIrphila Bakery Server ===`);
    console.log(`Server is running on port: ${PORT}`);
    console.log(`\nAccess the signup page at:`);
    console.log(`http://localhost:${PORT}/pages/signup.html`);
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
