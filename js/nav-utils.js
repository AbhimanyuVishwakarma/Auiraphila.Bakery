// Navigation Utilities for Auiraphila Bakery
// This script provides consistent navigation links across all pages

/**
 * Navigation Link Utility
 * 
 * This utility ensures links work correctly across all pages by:
 * 1. Determining the current page location (root, pages/, admin/, etc.)
 * 2. Generating correct relative paths for navigation links
 * 3. Updating all navigation links on the page to use the correct paths
 */

// Execute when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateNavigationLinks();
});

// Main function to update all navigation links
function updateNavigationLinks() {
    // Determine the base path based on current location
    const basePath = getBasePath();
    
    // Update all navigation links
    updateLinks(basePath);
    
    console.log('Navigation links updated with base path:', basePath);
}

// Determine the base path for links based on current page location
function getBasePath() {
    const path = window.location.pathname;
    
    // Check if we're in the root directory
    if (path.includes('/index.html') || path === '/' || path.split('/').length <= 2) {
        return './';
    }
    
    // Check if we're in the pages directory
    if (path.includes('/pages/')) {
        // Check if we're in a subdirectory of pages
        if (path.split('/').length > 3) {
            return '../../';
        }
        return '../';
    }
    
    // Check if we're in the admin directory
    if (path.includes('/admin/')) {
        return '../';
    }
    
    // Default to relative to root
    return '../';
}

// Update all navigation links with the correct base path
function updateLinks(basePath) {
    // Update main navigation links
    updateNavLinks(basePath);
    
    // Update logo link
    updateLogoLink(basePath);
    
    // Update other common links (login, cart, etc.)
    updateCommonLinks(basePath);
}

// Update main navigation menu links
function updateNavLinks(basePath) {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Skip external links and anchors
        if (href.startsWith('http') || href.startsWith('#') || href.startsWith('javascript:')) {
            return;
        }
        
        // Fix the path based on the link type
        if (href.includes('index.html') || href === './') {
            link.href = `${basePath}index.html`;
        } else if (href.includes('pages/')) {
            // Link already has pages/ prefix
            link.href = `${basePath}${href}`;
        } else if (href.endsWith('.html')) {
            // Link to HTML file without pages/ prefix
            if (basePath === './') {
                link.href = `${basePath}pages/${href}`;
            } else {
                // We're already in pages or admin
                link.href = `${basePath}${href}`;
            }
        }
    });
}

// Update the logo link to always point to home
function updateLogoLink(basePath) {
    const logoLinks = document.querySelectorAll('.logo a, a.logo');
    
    logoLinks.forEach(link => {
        link.href = `${basePath}index.html`;
    });
}

// Update common links like login, cart, etc.
function updateCommonLinks(basePath) {
    // Map of link text/class to their correct paths
    const commonLinks = {
        'Login': 'pages/login.html',
        'Account': 'pages/login.html',
        'Cart': 'pages/cart.html',
        'About Us': 'pages/about.html',
        'Contact': 'pages/contact.html',
        'Gallery': 'pages/gallery.html'
    };
    
    // Find links by text content
    document.querySelectorAll('a').forEach(link => {
        const text = link.textContent.trim();
        
        if (commonLinks[text]) {
            const path = commonLinks[text];
            link.href = `${basePath}${path}`;
        }
        
        // Check for cart icon links
        if (link.classList.contains('cart-icon') || link.querySelector('.fa-shopping-cart')) {
            link.href = `${basePath}pages/cart.html`;
        }
        
        // Check for account/login icon links
        if (link.classList.contains('account-icon') || link.querySelector('.fa-user')) {
            link.href = `${basePath}pages/login.html`;
        }
    });
}

// Export functions for use in other scripts
export { updateNavigationLinks, getBasePath };
