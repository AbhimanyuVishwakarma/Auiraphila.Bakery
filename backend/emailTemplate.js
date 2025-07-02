/**
 * Enhanced email template for order confirmations
 * This template provides a more visually appealing and detailed order confirmation email
 */

/**
 * Generate HTML for the enhanced order confirmation email
 * @param {Object} data - Order and customer data
 * @returns {String} HTML content for the email
 */
function generateOrderConfirmationEmail(data) {
  // Format date if provided, otherwise use current date
  const orderDate = data.orderDate || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format estimated delivery date (2 days from order date by default)
  const deliveryDate = data.deliveryDate || new Date(Date.now() + 2*24*60*60*1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate order items HTML
  const orderItemsHtml = data.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price}</td>
      <td>₹${item.quantity * item.price}</td>
    </tr>
  `).join('');

  // Calculate totals if not provided
  const subtotal = data.subtotal || data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = data.tax || Math.round(subtotal * 0.05);
  const delivery = data.delivery || 100;
  const discount = data.discount || 0;
  const total = data.totalAmount || (subtotal + tax + delivery - discount);

  // Payment information
  const paymentMethod = data.paymentMethod || 'Online Payment';
  const paymentStatus = data.paymentStatus || 'Paid';
  const transactionId = data.transactionId || `TXN${Date.now().toString().substring(5)}`;

  // Return the complete HTML template
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Auiraphila Bakery</title>
        <style>
            /* Reset styles */
            body, html {
                margin: 0;
                padding: 0;
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f9f5f0;
            }
            
            /* Container */
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            }
            
            /* Header */
            .email-header {
                background-color: #8b5a2b;
                color: #fff;
                padding: 20px;
                text-align: center;
            }
            
            .email-header h1 {
                margin: 0;
                font-size: 24px;
            }
            
            /* Content */
            .email-content {
                padding: 30px;
            }
            
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
            }
            
            .thank-you {
                margin-bottom: 30px;
            }
            
            .order-info {
                background-color: #f9f5f0;
                padding: 15px;
                border-radius: 6px;
                margin-bottom: 25px;
            }
            
            .order-info p {
                margin: 8px 0;
            }
            
            .order-info strong {
                color: #8b5a2b;
            }
            
            /* Items table */
            .order-items {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 25px;
            }
            
            .order-items th {
                background-color: #8b5a2b;
                color: #fff;
                text-align: left;
                padding: 10px;
            }
            
            .order-items td {
                padding: 12px 10px;
                border-bottom: 1px solid #eee;
            }
            
            .order-items tr:last-child td {
                border-bottom: none;
            }
            
            /* Price summary */
            .price-summary {
                background-color: #f9f5f0;
                padding: 15px;
                border-radius: 6px;
                margin-bottom: 25px;
            }
            
            .price-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
            }
            
            .price-row.total {
                font-weight: bold;
                font-size: 18px;
                border-top: 2px solid #ddd;
                padding-top: 8px;
                margin-top: 8px;
                color: #8b5a2b;
            }
            
            /* Payment method */
            .payment-method {
                background-color: #f9f5f0;
                padding: 15px;
                border-radius: 6px;
                margin-bottom: 25px;
            }
            
            /* Footer */
            .email-footer {
                background-color: #f1e8db;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #666;
            }
            
            .email-footer p {
                margin: 5px 0;
            }
            
            .contact-info {
                margin-top: 15px;
            }
            
            .social-links {
                margin-top: 15px;
            }
            
            .social-links a {
                color: #8b5a2b;
                text-decoration: none;
                margin: 0 10px;
            }
            
            .shipping-note {
                font-style: italic;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>Auiraphila Bakery</h1>
            </div>
            
            <div class="email-content">
                <div class="greeting">
                    <p>Hi ${data.fullName},</p>
                </div>
                
                <div class="thank-you">
                    <p>Thank you for your order! We're delighted to confirm that we've received your order and are preparing it with care.</p>
                </div>
                
                <div class="order-info">
                    <p><strong>Order ID:</strong> ${data.orderNumber}</p>
                    <p><strong>Order Date:</strong> ${orderDate}</p>
                    <p><strong>Estimated Delivery:</strong> ${deliveryDate}</p>
                </div>
                
                <h2>Order Details</h2>
                
                <table class="order-items">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderItemsHtml}
                    </tbody>
                </table>
                
                <div class="price-summary">
                    <h3>Price Summary</h3>
                    <div class="price-row">
                        <span>Subtotal:</span>
                        <span>₹${subtotal}</span>
                    </div>
                    <div class="price-row">
                        <span>GST (5%):</span>
                        <span>₹${tax}</span>
                    </div>
                    <div class="price-row">
                        <span>Delivery:</span>
                        <span>₹${delivery}</span>
                    </div>
                    <div class="price-row">
                        <span>Discount:</span>
                        <span>-₹${discount}</span>
                    </div>
                    <div class="price-row total">
                        <span>Total:</span>
                        <span>₹${total}</span>
                    </div>
                </div>
                
                <div class="payment-method">
                    <h3>Payment Information</h3>
                    <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                    <p><strong>Payment Status:</strong> ${paymentStatus}</p>
                    <p><strong>Transaction ID:</strong> ${transactionId}</p>
                </div>
                
                <div class="shipping-note">
                    <p>We'll notify you once your order is shipped!</p>
                </div>
            </div>
            
            <div class="email-footer">
                <p>© ${new Date().getFullYear()} Auiraphila Bakery. All rights reserved.</p>
                <div class="contact-info">
                    <p>123 Bakery Lane, Mumbai, India</p>
                    <p>Phone: +91 98765 43210 | Email: contact@auirphilabakery.com</p>
                </div>
                <div class="social-links">
                    <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">Twitter</a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

module.exports = { generateOrderConfirmationEmail };
