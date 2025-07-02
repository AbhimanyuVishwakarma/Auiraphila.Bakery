// Email Confirmation Redirect Handler
import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async function() {
    const confirmationStatus = document.getElementById('confirmationStatus');
    const loader = document.getElementById('loader');
    const loginBtn = document.getElementById('loginBtn');
    
    // Show loader
    loader.style.display = 'block';
    
    try {
        // Get the URL hash parameters
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        // Check if this is an email confirmation callback
        if (params.has('type') && params.get('type') === 'email_confirmation') {
            // Extract the access_token and refresh_token
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            
            if (accessToken && refreshToken) {
                // Set the session using the tokens
                const { data, error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });
                
                if (error) {
                    throw error;
                }
                
                // Email confirmed successfully
                confirmationStatus.innerHTML = `
                    <div class="confirmation-icon" style="color: #4CAF50;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>Email Confirmed!</h2>
                    <p>Your email has been successfully confirmed. You can now log in to your account.</p>
                `;
                
                // Show login button
                loginBtn.style.display = 'inline-block';
                
                // Redirect to login page after 3 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            } else {
                throw new Error('Invalid confirmation link. Missing tokens.');
            }
        } else {
            throw new Error('This is not a valid email confirmation link.');
        }
    } catch (error) {
        console.error('Email confirmation error:', error);
        
        // Show error message
        confirmationStatus.innerHTML = `
            <div class="confirmation-icon" style="color: #e74c3c;">
                <i class="fas fa-times-circle"></i>
            </div>
            <h2>Confirmation Failed</h2>
            <p>We couldn't confirm your email. The link may be invalid or expired.</p>
            <p>Error: ${error.message}</p>
        `;
        
        // Show login button anyway
        loginBtn.style.display = 'inline-block';
    } finally {
        // Hide loader
        loader.style.display = 'none';
    }
});
