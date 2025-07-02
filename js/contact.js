// Contact Form with Supabase Integration
import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const successModal = document.getElementById('successModal');
    const closeModalButtons = document.querySelectorAll('.close-modal, .close-success');

    // Form submission handler with Supabase integration
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Simple validation
            if (!name || !email || !message) {
                alert('Please fill in all required fields');
                return;
            }
            
            try {
                // Insert contact form data into Supabase
                const { data, error } = await supabase
                    .from('contacts')
                    .insert([
                        {
                            name: name,
                            email: email,
                            phone_number: phone,
                            subject: subject,
                            message: message
                        }
                    ]);
                
                if (error) {
                    throw error;
                }
                
                // Show success modal
                successModal.classList.remove('hidden');
                
                // Reset the form
                contactForm.reset();
                
            } catch (error) {
                console.error('Error submitting contact form:', error.message);
                alert('There was an error submitting your message: ' + error.message);
            }
        });
    }

    // Close modal when clicking close button
    if (closeModalButtons) {
        closeModalButtons.forEach(button => {
            button.addEventListener('click', function() {
                successModal.classList.add('hidden');
            });
        });
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === successModal) {
            successModal.classList.add('hidden');
        }
    });
});