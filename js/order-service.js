// Order Service - Handles order submission to Supabase
import { supabase } from './supabase.js';

/**
 * Submits an order to the Supabase database
 * @param {Object} orderData - The order data to submit
 * @returns {Promise} - A promise that resolves to the submitted order
 */
export async function submitOrder(orderData) {
    try {
        // Format the order data according to the database schema
        const formattedOrder = {
            order_number: orderData.orderNumber,
            user_email: orderData.email,
            full_name: orderData.fullName,
            mobile_number: orderData.phone,
            address_line1: orderData.addressLine1,
            address_line2: orderData.addressLine2 || '',
            city: orderData.city,
            state: orderData.state,
            zip_code: orderData.zipCode,
            country: orderData.country || 'India',
            order_items: orderData.items,
            total_bill: orderData.totalAmount,
            payment_method: orderData.paymentMethod
        };

        // Insert the order into the database
        const { data, error } = await supabase
            .from('orders')
            .insert([formattedOrder])
            .select();

        if (error) {
            console.error('Error submitting order:', error);
            throw new Error(`Failed to submit order: ${error.message}`);
        }

        console.log('Order submitted successfully:', data);
        return data;
    } catch (error) {
        console.error('Error in submitOrder:', error);
        throw error;
    }
}

/**
 * Gets an order by its order number
 * @param {string} orderNumber - The order number to look up
 * @returns {Promise} - A promise that resolves to the order data
 */
export async function getOrderByNumber(orderNumber) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('order_number', orderNumber)
            .single();

        if (error) {
            console.error('Error fetching order:', error);
            throw new Error(`Failed to fetch order: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error('Error in getOrderByNumber:', error);
        throw error;
    }
}
