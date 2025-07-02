// Vercel API route for saving orders
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ytjpbnkksgawikffgtfb.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0anBibmtrc2dhd2lrZmZndGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NDY5NzcsImV4cCI6MjA2NjMyMjk3N30.k_JUe3Uag5AizMl5B-OJ7oRYKuCEzL9xIG98h_3SmTc';

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

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Received order save request:', req.body);
    
    // Get the JWT token from the request headers
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('Using JWT token for authentication');
    }
    
    // Initialize Supabase with anon key and JWT token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: token ? {
          Authorization: `Bearer ${token}`
        } : {}
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
      country: req.body.country || 'India',
      order_items: req.body.items,
      subtotal: req.body.subtotal,
      tax: req.body.tax,
      shipping: req.body.shipping || 0,
      discount: req.body.discount || 0,
      total: req.body.total,
      payment_method: req.body.paymentMethod,
      payment_status: 'pending',
      order_status: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert the order into the database
    const { data, error } = await supabase
      .from('orders')
      .insert(formattedOrder)
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
    return res.status(200).json({
      success: true,
      message: 'Order saved successfully',
      id,
      order_number,
      order_display_id
    });
    
  } catch (err) {
    console.error('Server error saving order:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error processing order',
      error: err.message
    });
  }
};

module.exports = enableCors(handler);
