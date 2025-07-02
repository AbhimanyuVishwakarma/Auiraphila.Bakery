const transporter = require('./mailer');
const supabase = require('./supabaseClient'); // You need to set this up if not already

async function sendOrderConfirmationEmail(orderId, customerEmail) {
  const { data: orderDetails, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    throw error;
  }

  const mailOptions = {
    from: `"AuIrphila Bakery" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: customerEmail,
    subject: `Order Confirmation - Order #${orderDetails.id}`,
    html: `
      <h3>Hi ${orderDetails.full_name},</h3>
      <p>Thank you for your order!</p>
      <p><strong>Order ID:</strong> ${orderDetails.id}</p>
      <p><strong>Total:</strong> ₹${orderDetails.total_bill}</p>
      <br/>
      <p>We'll notify you once it's shipped!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log('Order confirmation email sent to:', customerEmail);
}

module.exports = sendOrderConfirmationEmail; 