// Signup Page Functionality with Supabase Integration
import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const inputFields = document.querySelectorAll('.input-field');
    
    // Add input field focus effects
    inputFields.forEach(field => {
        const input = field.querySelector('input');
        const icon = field.querySelector('i');
        
        if (input && icon) {
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
        }
    });
    
    // Handle signup form submission with Supabase integration
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const submitBtn = this.querySelector('button[type="submit"]');
            
            // Simple validation
            if (!fullname || !email || !phone || !password) {
                alert('Please fill in all required fields');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            // Add loading state to button
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Creating Account...';
            
            try {
                console.log('Starting signup for:', email);
                
                // 1. Create user in Supabase Auth with email confirmation
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: fullname
                        },
                        emailRedirectTo: window.location.origin + '/pages/confirmation-redirect.html'
                    }
                });
                
                console.log('Signup auth response:', authData ? 'Success' : 'Failed');
                
                if (authError) {
                    console.error('Detailed signup error:', authError);
                    throw authError;
                }
                
                console.log('User created in Auth:', authData.user.email);
                console.log('Email confirmation status:', authData.user.email_confirmed_at ? 'Confirmed' : 'Not confirmed');
                console.log('Redirect URL:', window.location.origin + '/pages/confirmation-redirect.html');
                
                // 2. Add user details to signups table
                const { data: signupData, error: signupError } = await supabase
                    .from('signups')
                    .insert([
                        {
                            full_name: fullname,
                            email: email,
                            phone_number: phone
                        }
                    ]);
                
                if (signupError) {
                    console.error('Error adding user to signups:', signupError);
                    // Continue anyway since auth was successful
                }
                
                // 3. Also add user details to logins table for synchronization
                const { data: loginData, error: loginError } = await supabase
                    .from('logins')
                    .insert([
                        {
                            email: email,
                            full_name: fullname,
                            phone_number: phone,
                            signup_date: new Date().toISOString()
                        }
                    ]);
                
                if (loginError) {
                    console.error('Error adding user to logins:', loginError);
                    // Continue anyway since auth and signup were successful
                }
                
                // Show success popup
                document.getElementById('successPopup').style.display = 'flex';
                
                // Reset form
                signupForm.reset();
                
                // Redirect to login page after a short delay
                setTimeout(() => {
                    const currentPath = window.location.pathname;
                    if (currentPath.includes('/pages/')) {
                        window.location.href = 'login.html';
                    } else {
                        window.location.href = 'pages/login.html';
                    }
                }, 3000); // 3 second delay to show the success message
                
            } catch (error) {
                console.error('Signup error:', error.message);
                alert('Signup failed: ' + error.message);
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Sign Up';
            }
        });
    }
    
    // Close popup when clicking the close button
    const closePopupBtn = document.querySelector('.close-popup');
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', function() {
            document.getElementById('successPopup').style.display = 'none';
        });
    }
    
    // Close popup when clicking outside the content
    window.addEventListener('click', function(e) {
        const successPopup = document.getElementById('successPopup');
        if (e.target === successPopup) {
            successPopup.style.display = 'none';
        }
    });
});
