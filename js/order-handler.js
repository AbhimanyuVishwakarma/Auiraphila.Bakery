// Order Handler - Connects checkout process to backend API
// No direct Supabase connection from frontend to avoid RLS issues

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
        
        // Use the backend API endpoint to save the order
        // Include the JWT token in the Authorization header
        const response = await fetch('/api/save-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            // Try to get error details from response
            let errorMessage = 'Failed to save order';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // If we can't parse the JSON, use status text
                errorMessage = `${errorMessage}: ${response.statusText}`;
            }
            
            console.error('Error response from server:', {
                status: response.status,
                statusText: response.statusText
            });
            
            throw new Error(errorMessage);
        }
        
        // Parse the successful response
        const result = await response.json();
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

// Add a global function to window object for non-module scripts to use
window.saveOrderToDatabase = saveOrderToDatabase;
