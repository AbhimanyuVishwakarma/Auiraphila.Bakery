// Utility functions for order management
import { supabase } from './supabase.js';

/**
 * Generates a sequential order number in YYYY-MM-XX format
 * where XX is the next available number for the current month
 * @returns {Promise<string>} The generated order number
 */
export async function generateOrderNumber() {
    try {
        // Get current date parts
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 1-12 -> 01-12
        const prefix = `${year}-${month}`;
        
        // Query the database to find the highest order number for this month
        const { data, error } = await supabase
            .from('orders')
            .select('order_display_id')
            .like('order_display_id', `${prefix}-%`)
            .order('order_display_id', { ascending: false })
            .limit(1);
            
        if (error) {
            console.error('Error fetching latest order number:', error);
            throw new Error(`Failed to generate order number: ${error.message}`);
        }
        
        let nextNumber = 1; // Default to 1 if no orders this month
        
        if (data && data.length > 0) {
            // Extract the number part from the latest order_display_id (e.g., '2023-06-05' -> 5)
            const latestNumberStr = data[0].order_display_id.split('-').pop();
            nextNumber = parseInt(latestNumberStr, 10) + 1;
            
            // Ensure we don't exceed 2 digits (though this is unlikely to happen)
            if (nextNumber > 99) {
                console.warn('Order number sequence approaching limit for this month');
            }
        }
        
        // Format the number with leading zeros (01, 02, ..., 10, 11, etc.)
        const sequence = String(nextNumber).padStart(2, '0');
        
        return `${prefix}-${sequence}`;
        
    } catch (error) {
        console.error('Error in generateOrderNumber:', error);
        // Fallback to timestamp-based number if there's an error
        return `ORD-${new Date().getTime()}`;
    }
}
