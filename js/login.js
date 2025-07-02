// Login/Signup Page Functionality with Supabase Integration
import { supabase } from './supabase.js';

// Debug flag - set to true to see console logs
const DEBUG = true;

// Admin credentials
const ADMIN_EMAIL = 'auirphilabakery@gmail.com';
const ADMIN_PASSWORD = 'Devanshi@2006';

// Prevent page reload on module load
if (window.history && window.history.pushState) {
    window.history.pushState('forward', null, window.location.href);
    window.onpopstate = function() {
        window.history.pushState('forward', null, window.location.href);
    };
}

// Function to show error messages
function showError(message) {
    // Remove any existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create and show new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.marginTop = '10px';
    errorDiv.style.padding = '10px';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.backgroundColor = '#fde8e8';
    errorDiv.style.border = '1px solid #f5c6cb';
    errorDiv.textContent = message;
    
    // Insert after the form
    const form = document.getElementById('login-form');
    if (form) {
        form.appendChild(errorDiv);
    } else {
        // Fallback to alert if form not found
        alert(message);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.style.opacity = '0';
            errorDiv.style.transition = 'opacity 0.5s';
            setTimeout(() => errorDiv.remove(), 500);
        }
    }, 5000);
}

// Login Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkAuthState();
    
    // Get form elements
    const loginForm = document.getElementById('login-form');
    const inputFields = document.querySelectorAll('.input-field');
    
    // Add animation to input fields on page load
    animateFormElements();
    
    // Function to animate form elements on load
    function animateFormElements() {
        // Animate input fields with delay
        inputFields.forEach((field, index) => {
            field.style.opacity = '0';
            field.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                field.style.transition = 'all 0.5s ease';
                field.style.opacity = '1';
                field.style.transform = 'translateY(0)';
            }, 100 * index);
        });
        
        // Animate button with delay
        const button = document.querySelector('.btn');
        if (button) {
            button.style.opacity = '0';
            button.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                button.style.transition = 'all 0.5s ease';
                button.style.opacity = '1';
                button.style.transform = 'scale(1)';
            }, 500);
        }
    }
    
    // Add input field focus effects
    inputFields.forEach(field => {
        const input = field.querySelector('input');
        const icon = field.querySelector('i');
        
        input.addEventListener('focus', () => {
            field.classList.add('focused');
            icon.style.color = '#f78fb3';
        });
        
        input.addEventListener('blur', () => {
            if (input.value === '') {
                field.classList.remove('focused');
                icon.style.color = '#acacac';
            }
        });
    });
    
    // Login functionality is handled by the form submit handler below
    
    // Handle login form submission with animation and Supabase integration
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            console.log('Form submission intercepted');
            e.preventDefault();
            e.stopPropagation();
            
            const email = document.getElementById('login-email')?.value;
            const password = document.getElementById('login-password')?.value;
            const isAdmin = document.getElementById('admin-login')?.checked || false;
            const submitBtn = this.querySelector('input[type="submit"]');
            
            // Simple validation
            if (!email || !password) {
                console.log('Validation failed: Missing email or password');
                shakeForm(this);
                showError('Please fill in all fields');
                return false;
            }
            
            // Add loading animation to button
            submitBtn.classList.add('loading');
            submitBtn.value = '';
            
            try {
                console.log('Attempting login with:', email);
                
                // First check if the user exists in Auth
                const { data: userCheckData, error: userCheckError } = await supabase
                    .from('signups')
                    .select('email, full_name')
                    .eq('email', email)
                    .maybeSingle();
                
                // If user doesn't exist in signups table, try to create them first
                if (!userCheckData) {
                    console.log('User not found in signups table, attempting to create account...');
                    
                    // Try to create the user in Auth
                    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                        email: email,
                        password: password,
                        options: {
                            data: { full_name: email.split('@')[0] },
                            emailRedirectTo: window.location.origin + '/pages/confirmation-redirect.html'
                        }
                    });
                    
                    if (signUpError) {
                        console.error('Error creating user:', signUpError);
                        // Continue with login attempt anyway
                    } else {
                        console.log('User created successfully, now attempting login');
                    }
                }
                
                // Now attempt to sign in
                // Check if user is trying to login as admin
                const adminLoginCheckbox = document.getElementById('admin-login');
                const isAdminLogin = adminLoginCheckbox && adminLoginCheckbox.checked;
                
                if (isAdminLogin) {
                    // Verify admin credentials
                    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                        console.log('Admin login successful');
                        
                        // Store admin status in localStorage
                        localStorage.setItem('adminLoggedIn', 'true');
                        
                        // Redirect to admin dashboard
                        window.location.href = '../admin/admin-dashboard.html';
                        return; // Exit the function early
                    } else {
                        // Admin login failed
                        throw new Error('Invalid admin credentials');
                    }
                }
                
                // Regular user login with Supabase
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                
                console.log('Login response:', data ? 'Success' : 'Failed');
                
                if (error) {
                    console.error('Detailed login error:', error);
                    throw error;
                }
                
                console.log('Login successful, user:', data?.user?.email);
                
                // Record login in the logins table with more details
                // Get user data from auth
                const { data: { user } } = await supabase.auth.getUser();
                const authUserData = user?.user_metadata || {};
                
                // Get user's full name from auth metadata or from email
                let fullName = authUserData?.full_name || email.split('@')[0];
                
                // Check if user exists in signups table to get their full name
                const { data: signupData } = await supabase
                    .from('signups')
                    .select('full_name')
                    .eq('email', email)
                    .maybeSingle();
                
                if (signupData && signupData.full_name) {
                    fullName = signupData.full_name;
                }
                
                // Always create a new login record for each login
                const { error: insertError } = await supabase.from('logins').insert([{
                    email: email,
                    full_name: fullName,
                    last_login: new Date().toISOString()
                }]);
                
                if (insertError) {
                    console.error('Error recording login:', insertError);
                } else {
                    console.log('Login recorded successfully for:', email);
                }
                
                // Check if user exists in signups table
                const { data: signupUserData, error: userError } = await supabase
                    .from('signups')
                    .select('*')
                    .eq('email', email)
                    .single();
                
                if (userError && userError.code !== 'PGRST116') {
                    console.error('Error checking user:', userError);
                }
                
                // If user doesn't exist in signups, add them with more complete details
                if (!signupUserData) {
                    // Get any additional data we might have from the logins table
                    const fullName = signupUserData?.full_name || authUserData?.full_name || email.split('@')[0];
                    const phoneNumber = signupUserData?.phone_number || '';
                    
                    await supabase.from('signups').insert([{ 
                        email: email,
                        full_name: fullName,
                        phone_number: phoneNumber,
                        signup_date: new Date().toISOString()
                    }]);
                    
                    console.log('User added to signups table:', email);
                } else {
                    // Update the existing signup record with latest login
                    await supabase.from('signups').update({
                        last_login: new Date().toISOString()
                    }).eq('email', email);
                    
                    console.log('Updated existing signup record:', email);
                }
                
                // Create login success event
                const loginSuccessEvent = new CustomEvent('loginSuccess', { 
                    detail: { 
                        user: data.user,
                        isAdmin: false // Regular user login
                    }
                });
                document.dispatchEvent(loginSuccessEvent);
                
                // Check if there's a saved redirect URL
                const savedRedirectUrl = sessionStorage.getItem('redirectAfterLogin');
                
                // Determine redirect URL based on admin status and saved URL
                let redirectUrl;
                if (isAdmin) {
                    redirectUrl = '../admin/dashboard.html?login=success';
                } else if (savedRedirectUrl) {
                    // Clear the saved URL
                    sessionStorage.removeItem('redirectAfterLogin');
                    redirectUrl = savedRedirectUrl + (savedRedirectUrl.includes('?') ? '&' : '?') + 'login=success';
                } else {
                    redirectUrl = '../index.html?login=success';
                }
                
                console.log('Login successful, redirecting to:', redirectUrl);
                window.location.href = redirectUrl;
            } catch (error) {
                console.error('Login error:', error.message);
                submitBtn.classList.remove('loading');
                submitBtn.value = 'Login';
                
                // Create or get error message container
                let errorContainer = document.getElementById('login-error-container');
                if (!errorContainer) {
                    errorContainer = document.createElement('div');
                    errorContainer.id = 'login-error-container';
                    errorContainer.style.marginTop = '15px';
                    errorContainer.style.padding = '10px';
                    errorContainer.style.borderRadius = '5px';
                    errorContainer.style.backgroundColor = '#fff3f3';
                    errorContainer.style.border = '1px solid #e74c3c';
                    errorContainer.style.color = '#e74c3c';
                    errorContainer.style.fontSize = '14px';
                    errorContainer.style.textAlign = 'center';
                    errorContainer.style.display = 'none';
                    
                    // Add the error container after the form
                    loginForm.appendChild(errorContainer);
                }
                
                // Create or get action container for dynamic UI elements
                let actionContainer = document.getElementById('login-action-container');
                if (!actionContainer) {
                    actionContainer = document.createElement('div');
                    actionContainer.id = 'login-action-container';
                    actionContainer.style.marginTop = '15px';
                    actionContainer.style.textAlign = 'center';
                    
                    // Add the action container after the error container
                    loginForm.appendChild(actionContainer);
                }
                
                // Clear previous content
                errorContainer.innerHTML = '';
                actionContainer.innerHTML = '';
                
                // Show error container
                errorContainer.style.display = 'block';
                
                // Handle different error types with specific messages and actions
                if (error.message.includes('Email not confirmed') || 
                    error.message.includes('Email link is invalid or has expired')) {
                    // Handle unconfirmed email
                    errorContainer.innerHTML = `
                        <div class="error-icon"><i class="fas fa-envelope"></i></div>
                        <h3>Email Not Confirmed</h3>
                        <p>Please confirm your email address before logging in. Check your inbox for a confirmation email.</p>
                        <p><small>If you don't see the email, check your spam folder.</small></p>
                    `;
                    
                    // Add resend button
                    const resendButton = document.createElement('button');
                    resendButton.className = 'btn';
                    resendButton.style.backgroundColor = '#3498db';
                    resendButton.style.marginTop = '10px';
                    resendButton.innerHTML = '<i class="fas fa-paper-plane"></i> Resend Confirmation Email';
                    
                    resendButton.addEventListener('click', async () => {
                        resendButton.disabled = true;
                        resendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                        
                        try {
                            await supabase.auth.resend({
                                type: 'signup',
                                email: email,
                                options: {
                                    emailRedirectTo: window.location.origin + '/pages/confirmation-redirect.html'
                                }
                            });
                            
                            // Show success message
                            errorContainer.style.backgroundColor = '#efffef';
                            errorContainer.style.border = '1px solid #2ecc71';
                            errorContainer.style.color = '#2ecc71';
                            errorContainer.innerHTML = `
                                <div class="success-icon"><i class="fas fa-check-circle"></i></div>
                                <h3>Email Sent!</h3>
                                <p>Confirmation email has been sent to ${email}.</p>
                                <p><small>Please check your inbox and spam folder.</small></p>
                            `;
                            
                            // Remove the resend button
                            actionContainer.innerHTML = '';
                        } catch (resendError) {
                            console.error('Error resending confirmation:', resendError);
                            
                            // Reset button
                            resendButton.disabled = false;
                            resendButton.innerHTML = '<i class="fas fa-paper-plane"></i> Resend Confirmation Email';
                            
                            // Show error message
                            errorContainer.innerHTML += `
                                <div class="error-message" style="margin-top: 10px;">
                                    <i class="fas fa-exclamation-circle"></i> 
                                    Could not resend email: ${resendError.message}
                                </div>
                            `;
                        }
                    });
                    
                    actionContainer.appendChild(resendButton);
                    
                } else if (error.message.includes('Invalid login credentials')) {
                    // Try to determine if the user exists in the system
                    const { data: userExists } = await supabase
                        .from('signups')
                        .select('email')
                        .eq('email', email)
                        .maybeSingle();
                    
                    if (userExists) {
                        // Wrong password case
                        shakeForm(loginForm);
                        
                        errorContainer.innerHTML = `
                            <div class="error-icon"><i class="fas fa-lock"></i></div>
                            <h3>Incorrect Password</h3>
                            <p>The password you entered is incorrect. Please try again or reset your password.</p>
                        `;
                        
                        // Add reset password button
                        const resetButton = document.createElement('button');
                        resetButton.className = 'btn';
                        resetButton.style.backgroundColor = '#3498db';
                        resetButton.style.marginTop = '10px';
                        resetButton.innerHTML = '<i class="fas fa-key"></i> Reset Password';
                        
                        resetButton.addEventListener('click', async () => {
                            resetButton.disabled = true;
                            resetButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Reset Email...';
                            
                            try {
                                await supabase.auth.resetPasswordForEmail(email, {
                                    redirectTo: window.location.origin + '/pages/forgot-password.html'
                                });
                                
                                // Show success message
                                errorContainer.style.backgroundColor = '#efffef';
                                errorContainer.style.border = '1px solid #2ecc71';
                                errorContainer.style.color = '#2ecc71';
                                errorContainer.innerHTML = `
                                    <div class="success-icon"><i class="fas fa-check-circle"></i></div>
                                    <h3>Password Reset Email Sent!</h3>
                                    <p>Instructions to reset your password have been sent to ${email}.</p>
                                    <p><small>Please check your inbox and spam folder.</small></p>
                                `;
                                
                                // Remove the reset button
                                actionContainer.innerHTML = '';
                            } catch (resetError) {
                                console.error('Error sending reset email:', resetError);
                                
                                // Reset button
                                resetButton.disabled = false;
                                resetButton.innerHTML = '<i class="fas fa-key"></i> Reset Password';
                                
                                // Show error message
                                errorContainer.innerHTML += `
                                    <div class="error-message" style="margin-top: 10px;">
                                        <i class="fas fa-exclamation-circle"></i> 
                                        Could not send reset email: ${resetError.message}
                                    </div>
                                `;
                            }
                        });
                        
                        actionContainer.appendChild(resetButton);
                        
                    } else {
                        // No account case
                        shakeForm(loginForm);
                        
                        errorContainer.innerHTML = `
                            <div class="error-icon"><i class="fas fa-user-times"></i></div>
                            <h3>Account Not Found</h3>
                            <p>No account exists with email: ${email}</p>
                            <p>Would you like to create a new account?</p>
                        `;
                        
                        // Add signup button
                        const signupButton = document.createElement('button');
                        signupButton.className = 'btn';
                        signupButton.style.backgroundColor = '#2ecc71';
                        signupButton.style.marginTop = '10px';
                        signupButton.innerHTML = '<i class="fas fa-user-plus"></i> Create New Account';
                        
                        signupButton.addEventListener('click', () => {
                            window.location.href = 'signup.html?email=' + encodeURIComponent(email);
                        });
                        
                        actionContainer.appendChild(signupButton);
                    }
                } else {
                    // Generic error case
                    shakeForm(loginForm);
                    
                    errorContainer.innerHTML = `
                        <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
                        <h3>Login Failed</h3>
                        <p>${error.message}</p>
                        <p><small>Please try again or contact support if the problem persists.</small></p>
                    `;
                    
                    // Add help button
                    const helpButton = document.createElement('button');
                    helpButton.className = 'btn';
                    helpButton.style.backgroundColor = '#95a5a6';
                    helpButton.style.marginTop = '10px';
                    helpButton.innerHTML = '<i class="fas fa-question-circle"></i> Get Help';
                    
                    helpButton.addEventListener('click', () => {
                        window.location.href = 'contact.html?subject=' + encodeURIComponent('Login Help Needed');
                    });
                    
                    actionContainer.appendChild(helpButton);
                }
            }
        });
    }
    
    // Function to shake form on validation error
    function shakeForm(form) {
        form.classList.add('shake');
        setTimeout(() => {
            form.classList.remove('shake');
        }, 500);
    }
    
    // Check if user is already authenticated
    async function checkAuthState() {
        try {
            // Get current user session
            const { data: { session }, error } = await supabase.auth.getSession();
            
            // Only redirect if we're on the login page and user is already authenticated
            if (session?.user && window.location.pathname.includes('login.html')) {
                // Check if we're already on the home page to prevent redirect loops
                if (!window.location.pathname.includes('index.html')) {
                const baseUrl = window.location.origin;
                const redirectUrl = `${baseUrl}/index.html?login=success`;
                console.log('Already logged in, redirecting to:', redirectUrl);
                window.location.href = redirectUrl;
                }
            }
        } catch (error) {
            console.error('Authentication check error:', error.message);
        }
    }
});

async function handleLogout(e) {
    e.preventDefault();

    // Check if a session exists before trying to log out
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        alert('You are already logged out.');
        // Optionally, redirect to login page
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