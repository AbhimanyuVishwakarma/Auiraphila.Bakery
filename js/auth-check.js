// Authentication Check Script
// This script checks if the user is logged in and redirects to login page if not

import { supabase } from './supabase.js';

// Debug flag - set to true to see console logs
const DEBUG = true;

// Pages that don't require authentication
const PUBLIC_PAGES = [
    'login.html',
    'signup.html',
    'forgot-password.html',
    'reset-password.html'
];

// Function to check if the current page is a public page
function isPublicPage() {
    const currentPath = window.location.pathname;
    return PUBLIC_PAGES.some(page => currentPath.includes(page));
}

// Function to save the current URL to redirect back after login
function saveRedirectUrl() {
    // Don't save login page as redirect
    if (isPublicPage()) return;
    
    // Save current URL to session storage
    const currentUrl = window.location.href;
    sessionStorage.setItem('redirectAfterLogin', currentUrl);
    
    if (DEBUG) console.log('Saved redirect URL:', currentUrl);
}

// Main authentication check function
async function checkAuthentication() {
    try {
        if (DEBUG) console.log('Checking authentication status...');
        
        // Skip check for public pages
        if (isPublicPage()) {
            if (DEBUG) console.log('On public page, skipping auth check');
            return;
        }
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Auth check error:', error.message);
            redirectToLogin();
            return;
        }
        
        // If no session, redirect to login
        if (!session || !session.user) {
            if (DEBUG) console.log('No active session found, redirecting to login');
            redirectToLogin();
            return;
        }
        
        if (DEBUG) console.log('User is authenticated:', session.user.email);
        
    } catch (error) {
        console.error('Authentication check failed:', error.message);
        redirectToLogin();
    }
}

// Function to redirect to login page
function redirectToLogin() {
    // Save current URL for redirect after login
    saveRedirectUrl();
    
    // Determine the correct path to login page
    let loginPath;
    if (window.location.pathname.includes('/pages/')) {
        loginPath = 'login.html';
    } else {
        loginPath = 'pages/login.html';
    }
    
    // Redirect to login page
    window.location.href = loginPath;
}

// Run authentication check when DOM is loaded
document.addEventListener('DOMContentLoaded', checkAuthentication);

// Export functions for use in other scripts
export { checkAuthentication, isPublicPage, saveRedirectUrl };
