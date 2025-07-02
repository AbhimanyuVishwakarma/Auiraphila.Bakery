// Email Service for AuIrphila Bakery
// This module handles email sending functionality using Nodemailer (via backend API)

/**
 * Sends an order confirmation email to the customer
 * @param {Object} orderData - Order information including customer details and order items
 * @returns {Promise} - Promise that resolves when email is sent
 */
export async function sendOrderConfirmationEmail(orderData) {
    try {
        // Call the backend API endpoint that uses Nodemailer
        const response = await fetch('/api/confirm-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: orderData.orderNumber,
                customerEmail: orderData.email,
                customerName: orderData.fullName,
                totalAmount: orderData.totalAmount,
                // Add other order details as needed
            })
        });
        
        if (!response.ok) {
            throw new Error(`Email API responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Email sent successfully via backend:', result);
        return result;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}

/**
 * Sends a welcome email to new users
 * @param {string} email - User's email address
 * @param {string} fullName - User's full name
 * @returns {Promise} - Promise that resolves when email is sent
 */
export async function sendWelcomeEmail(email, fullName) {
    try {
        // Call the backend API endpoint that uses Nodemailer
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                fullname: fullName
            })
        });
        
        if (!response.ok) {
            throw new Error(`Signup API responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Welcome email sent successfully via backend:', result);
        return result;
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        throw error;
    }
}
