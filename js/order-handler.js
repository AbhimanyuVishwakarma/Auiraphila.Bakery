// Order Handler - Connects checkout process to backend API
// Uses API client for flexible backend URL configuration

// Function to save order to database using backend API endpoint
export async function saveOrderToDatabase(orderData) {
    try {
        console.log('Starting to save order to database via backend API...');
        
        // Log the order data being received
        console.log('Order data received:', JSON.stringify(orderData, null, 2));
        
        // Get the JWT token from Supabase auth
        let token = null;
        try {
            // Import the supabase client from the local file
            const { supabase } = await import('./supabase.js');
            const { data } = await supabase.auth.getSession();
            token = data.session?.access_token;
            console.log('Got JWT token for authentication');
        } catch (e) {
            console.error('Error getting JWT token:', e);
        }
        
        // Use the API client to save the order
        // The API client will use the configured backend URL
        const result = await window.apiClient.saveOrder(orderData, token);
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to save order');
        }
        
        console.log('Order inserted successfully. Data returned:', result);
        
        // Return the order ID and display ID
        return {
            id: result.id,
            order_display_id: result.order_display_id
        };
    } catch (error) {
        console.error('Error in saveOrderToDatabase:', error);
        throw error;
    }
}

// Function to send order confirmation email
export async function sendOrderConfirmation(orderData) {
    try {
        console.log('Sending order confirmation email...');
        
        // Use the API client to send confirmation email
        const result = await window.apiClient.confirmOrder(orderData);
        
        if (!result.success && !result.message.includes('sent')) {
            throw new Error(result.message || 'Failed to send order confirmation');
        }
        
        console.log('Order confirmation email sent successfully');
        return result;
    } catch (error) {
        console.error('Error sending order confirmation:', error);
        throw error;
    }
}

// Add global functions to window object for non-module scripts to use
window.saveOrderToDatabase = saveOrderToDatabase;
window.sendOrderConfirmation = sendOrderConfirmation;
