// Authentication management for Auiraphila Bakery
import { supabase } from './supabase.js';

// Check if user is authenticated and redirect if needed
async function checkAuth() {
    try {
        // Get current user session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Get current page path
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.includes('/login.html');
        const isSignupPage = currentPath.includes('/signup.html');
        const isForgotPasswordPage = currentPath.includes('/forgot-password.html');
        const isResetPasswordPage = currentPath.includes('/reset-password.html');
        const isAuthPage = isLoginPage || isSignupPage || isForgotPasswordPage || isResetPasswordPage;
        
        // If user is authenticated
        if (session && session.user) {
            // If on login or signup page, redirect to home
            if (isAuthPage) {
                window.location.href = currentPath.includes('/pages/') ? '../index.html' : 'index.html';
                return;
            }
            
            // Update UI for logged-in state
            updateUIForLoggedInUser(session.user);
        } 
        // If user is not authenticated
        else {
            // Always redirect to login page if not on an auth page
            if (!isAuthPage) {
                // Save the current URL to redirect back after login
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                
                // Redirect to login page
                const isInPagesDir = currentPath.includes('/pages/');
                const loginUrl = isInPagesDir ? 'login.html' : 'pages/login.html';
                window.location.href = loginUrl;
                return;
            }
            
            // Update UI for logged-out state
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('Authentication check error:', error.message);
        // On error, redirect to login page as a fallback
        if (!window.location.pathname.includes('/login.html')) {
            const isInPagesDir = window.location.pathname.includes('/pages/');
            const loginUrl = isInPagesDir ? 'login.html' : 'pages/login.html';
            window.location.href = loginUrl;
        }
    }
}

// Update UI elements for logged-in user
function updateUIForLoggedInUser(user) {
    // Find all login buttons/links
    const loginButtons = document.querySelectorAll('.login-button, .user-account a[href*="login"]');
    
    // Update login buttons to logout
    loginButtons.forEach(button => {
        // Change href to # (will be handled by event listener)
        button.setAttribute('href', '#');
        
        // Change text to "Logout"
        if (button.textContent.trim().toLowerCase().includes('login')) {
            button.textContent = 'Logout';
        }
        
        // Change icon if it exists
        const icon = button.querySelector('i.fa-user, i.fas.fa-user');
        if (icon) {
            icon.classList.remove('fa-user');
            icon.classList.add('fa-sign-out-alt');
        }
        
        // Add logout event listener
        button.addEventListener('click', handleLogout);
    });
    
    // Display user email or name if available
    const userDisplayElements = document.querySelectorAll('.user-display, .user-name');
    if (userDisplayElements.length > 0) {
        // Get user display name (email or name if available)
        const displayName = user.user_metadata?.full_name || user.email;
        
        userDisplayElements.forEach(element => {
            element.textContent = displayName;
            element.classList.remove('hidden');
        });
    }
}

// Update UI elements for logged-out user
function updateUIForLoggedOutUser() {
    // Find all logout buttons and convert to login
    const logoutButtons = document.querySelectorAll('.login-button, .user-account a[href="#"]');
    
    logoutButtons.forEach(button => {
        // Change href to login page
        if (window.location.pathname.includes('/pages/')) {
            button.setAttribute('href', 'login.html');
        } else {
            button.setAttribute('href', 'pages/login.html');
        }
        
        // Change text to "Login"
        if (button.textContent.trim().toLowerCase().includes('logout')) {
            button.textContent = 'Login';
        }
        
        // Change icon if it exists
        const icon = button.querySelector('i.fa-sign-out-alt');
        if (icon) {
            icon.classList.remove('fa-sign-out-alt');
            icon.classList.add('fa-user');
        }
        
        // Remove logout event listener
        button.removeEventListener('click', handleLogout);
    });
    
    // Hide user display elements
    const userDisplayElements = document.querySelectorAll('.user-display, .user-name');
    userDisplayElements.forEach(element => {
        element.textContent = '';
        element.classList.add('hidden');
    });
}

// Handle logout action
async function handleLogout(e) {
    e.preventDefault();

    // Check if a session exists before trying to log out
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        // No session, just redirect to login
        if (window.location.pathname.includes('/pages/')) {
            window.location.href = 'login.html';
        } else {
            window.location.href = 'pages/login.html';
        }
        return;
    }
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw error;
        }
        // Redirect to login page after logout
        if (window.location.pathname.includes('/pages/')) {
            window.location.href = 'login.html';
        } else {
            window.location.href = 'pages/login.html';
        }
    } catch (error) {
        console.error('Logout error:', error.message);
        alert('Error logging out: ' + error.message);
    }
}

// Export functions
export { checkAuth, updateUIForLoggedInUser, updateUIForLoggedOutUser, handleLogout };

// Run authentication check when script is loaded
document.addEventListener('DOMContentLoaded', checkAuth);

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}
const welcomePopup = document.getElementById('welcomePopup');
if (welcomePopup) {
    welcomePopup.classList.add('active');
}
// Optionally, wait for user to click "Continue" before redirecting to home

export async function saveOrderToDatabase(orderData) {
    try {
        // Prepare order data (do NOT include order_number or order_display_id)
        const formattedOrder = {
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

        // Insert the order and get the generated id and order_number
        const { data, error } = await supabase
            .from('orders')
            .insert([formattedOrder])
            .select('id, order_number');

        if (error) {
            console.error('Error saving order:', error);
            throw new Error(`Failed to save order: ${error.message}`);
        }

        const { id, order_number } = data[0];
        const order_display_id = `ORD-${new Date().getFullYear()}-${order_number}`;

        // Update the order with the display ID
        const { error: updateError } = await supabase
            .from('orders')
            .update({ order_display_id })
            .eq('id', id);

        if (updateError) {
            console.error('Error updating order_display_id:', updateError);
        }

        // Return the order info (including display id)
        return { id, order_number, order_display_id };
    } catch (error) {
        console.error('Error in saveOrderToDatabase:', error);
        throw error;
    }
}
