// Main JavaScript for AuIrphila Bakery

// Supabase client will be loaded from a separate script tag

// Authentication check on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

// Check if user is authenticated and update UI accordingly
async function checkAuth() {
    try {
        // Get current user session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Get current page path
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.includes('/login.html');
        const isSignupPage = currentPath.includes('/signup.html');
        const isAuthPage = isLoginPage || isSignupPage;
        
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
            // Always redirect to login page if not on login or signup page
            if (!isAuthPage) {
                if (currentPath.includes('/pages/')) {
                    window.location.href = 'login.html';
                } else {
                    window.location.href = 'pages/login.html';
                }
                return;
            }
            
            // Update UI for logged-out state
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('Authentication check error:', error.message);
    }
}

// Update UI elements for logged-in user
function updateUIForLoggedInUser(user) {
    // Find all login buttons/links
    const loginButtons = document.querySelectorAll('.user-account a[href*="login"]');
    
    // Update login buttons to logout
    loginButtons.forEach(button => {
        // Change href to # (will be handled by event listener)
        button.setAttribute('href', '#');
        
        // Change text content if it exists
        const textNode = Array.from(button.childNodes).find(node => 
            node.nodeType === Node.TEXT_NODE && node.textContent.trim());
        if (textNode && textNode.textContent.trim().toLowerCase().includes('login')) {
            textNode.textContent = 'Logout';
        }
        
        // Change icon if it exists
        const icon = button.querySelector('i.fa-user');
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
    const logoutButtons = document.querySelectorAll('.user-account a[href="#"]');
    
    logoutButtons.forEach(button => {
        // Change href to login page
        if (window.location.pathname.includes('/pages/')) {
            button.setAttribute('href', 'login.html');
        } else {
            button.setAttribute('href', 'pages/login.html');
        }
        
        // Change text content if it exists
        const textNode = Array.from(button.childNodes).find(node => 
            node.nodeType === Node.TEXT_NODE && node.textContent.trim());
        if (textNode && textNode.textContent.trim().toLowerCase().includes('logout')) {
            textNode.textContent = 'Login';
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
}

// Handle logout action
async function handleLogout(e) {
    e.preventDefault();
    
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

// Discount Pop-up Functionality
document.addEventListener('DOMContentLoaded', function() {
    const discountPopup = document.getElementById('discount-popup');
    const claimButton = document.getElementById('claim-button');
    
    // Check if the popup has been shown before in this session
    if (!sessionStorage.getItem('popupShown')) {
        // Show the popup after a short delay
        setTimeout(function() {
            discountPopup.classList.add('show');
        }, 1500);
        
        // Mark that the popup has been shown in this session
        sessionStorage.setItem('popupShown', 'true');
    }
    
    // Close the popup when the claim button is clicked
    if (claimButton) {
        claimButton.addEventListener('click', function() {
            discountPopup.classList.remove('show');
            
            // Optional: You could redirect to a specific page or apply the discount
            // window.location.href = 'pages/categories.html';
        });
    }
});


// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.hamburger-menu') && 
            !event.target.closest('.mobile-nav') && 
            mobileNav.classList.contains('active')) {
            hamburgerMenu.classList.remove('active');
            mobileNav.classList.remove('active');
        }
    });
    
    // Search functionality
    const searchBar = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            performSearch();
        });
    }
    
    if (searchBar) {
        searchBar.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    function performSearch() {
        const searchTerm = searchBar.value.trim().toLowerCase();
        if (searchTerm.length > 0) {
            // In a real implementation, this would redirect to search results
            // For now, we'll just alert the search term
            alert(`Searching for: ${searchTerm}`);
            // window.location.href = `search-results.html?query=${encodeURIComponent(searchTerm)}`;
        }
    }
    
    // Gallery Animation - FIXED VERSION
    // Animate gallery items when they come into view
    const galleryItems = document.querySelectorAll('.gallery-item[data-animation="fade-in"]');
    
    const animateOnScroll = function() {
        galleryItems.forEach(item => {
            const itemPosition = item.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (itemPosition < screenPosition) {
                item.classList.add('animate');
            }
        });
    };
    
    // Run once on page load
    animateOnScroll();
    
    // Run on scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Optional: Add click functionality to open images in a lightbox
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').src;
            const title = this.querySelector('h3').textContent;
            
            // You can implement a lightbox here or navigate to a detail page
            console.log(`Image clicked: ${title} - ${imgSrc}`);
            // Example: openLightbox(imgSrc, title);
        });
    });
    
    // Newsletter subscription form
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email) {
                // In a real implementation, this would send the email to a server
                // For now, we'll just show a success message
                alert(`Thank you for subscribing with: ${email}`);
                emailInput.value = '';
            }
        });
    }
});

// Filter Section Animations and Interactions
document.addEventListener('DOMContentLoaded', function() {
    // Price slider interaction
    const priceSlider = document.querySelector('.price-slider');
    const priceRange = document.querySelector('.price-range');
    
    if (priceSlider && priceRange) {
        priceSlider.addEventListener('input', function() {
            const value = this.value;
            priceRange.textContent = `$0 - $${value}`;
            priceRange.classList.add('updating');
            
            // Remove the animation class after animation completes
            setTimeout(() => {
                priceRange.classList.remove('updating');
            }, 500);
        });
    }
    
    // Checkbox animations
    const checkboxes = document.querySelectorAll('.checkbox-filters input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                this.parentElement.style.color = '#e07a5f';
                this.parentElement.style.fontWeight = '600';
            } else {
                this.parentElement.style.color = '#5a4a42';
                this.parentElement.style.fontWeight = 'normal';
            }
        });
    });
    
    // Select dropdown animation
    const filterSelect = document.querySelector('.filter-group select');
    
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            this.style.transform = 'scale(1.05)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 300);
        });
    }
});

// Account Dropdown Toggle
document.addEventListener('DOMContentLoaded', function() {
    const accountToggle = document.querySelector('.account-toggle');
    
    if (accountToggle) {
        accountToggle.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.user-account')) {
                accountToggle.classList.remove('active');
            }
        });
    }
    
    // Handle the #signup hash in URL to show signup form
    if (window.location.hash === '#signup' && window.location.pathname.includes('login.html')) {
        const formsWrapper = document.querySelector('.forms-wrapper');
        if (formsWrapper) {
            formsWrapper.classList.add('signup-active');
        }
    }
});

// Enhanced Category cards animation
document.addEventListener('DOMContentLoaded', function() {
  // Animate category cards when they come into view
  const categoryCards = document.querySelectorAll('.category-card');
  
  const animateCategoryCards = function() {
    categoryCards.forEach(card => {
      const cardPosition = card.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.2;
      
      if (cardPosition < screenPosition) {
        card.style.opacity = '1';
      }
    });
  };
  
  // Run on scroll
  window.addEventListener('scroll', animateCategoryCards);
  
  // Run once on page load
  animateCategoryCards();
  
  // Preload images for smoother transitions
  categoryCards.forEach(card => {
    const img = card.querySelector('img');
    if (img) {
      const newImg = new Image();
      newImg.src = img.src;
    }
  });
  
  // Add hover effect for category cards
  categoryCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.classList.add('hover-active');
    });
    
    card.addEventListener('mouseleave', function() {
      this.classList.remove('hover-active');
    });
  });
});

// Footer animations for all pages
document.addEventListener('DOMContentLoaded', function() {
    // Animate footer elements on page load
    const footerColumns = document.querySelectorAll('.footer-column');
    
    footerColumns.forEach((column, index) => {
        column.style.opacity = '0';
        column.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            column.style.transition = 'all 0.5s ease';
            column.style.opacity = '1';
            column.style.transform = 'translateY(0)';
        }, 300 * index);
    });
    
    // Newsletter form animation
    const newsletterForm = document.querySelector('.newsletter-form');
    const subscribeButton = document.querySelector('.newsletter-form button');
    
    if (newsletterForm && subscribeButton) {
        subscribeButton.addEventListener('click', function(e) {
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            
            if (emailInput.value.trim() !== '' && emailInput.checkValidity()) {
                e.preventDefault();
                
                // Show success animation
                subscribeButton.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
                subscribeButton.style.background = 'linear-gradient(to right, #4CAF50, #81C784)';
                
                // Reset after 3 seconds
                setTimeout(() => {
                    subscribeButton.innerHTML = 'Subscribe';
                    subscribeButton.style.background = '';
                    emailInput.value = '';
                }, 3000);
            }
        });
    }
    
    // Social icons hover effect
    const socialIcons = document.querySelectorAll('.social-icons a');
    
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.animation = 'pulse 0.5s infinite';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.animation = '';
        });
    });
    
    // Copyright text animation
    const copyrightText = document.querySelector('.copyright p');
    
    if (copyrightText) {
        // Add hover effect
        copyrightText.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.color = '#f8b195';
            this.style.transition = 'all 0.3s ease';
        });
        
        copyrightText.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.color = 'rgba(255, 255, 255, 0.8)';
        });
    }
});

// Team Cards Animation
document.addEventListener('DOMContentLoaded', function() {
    // Animate team cards when they come into view
    const teamCards = document.querySelectorAll('.team-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    teamCards.forEach(card => {
        observer.observe(card);
        
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.querySelector('h3').style.color = '#e07a5f';
        });
        
        card.addEventListener('mouseleave', function() {
            this.querySelector('h3').style.color = '#3c2a21';
        });
    });
    
    // Add staggered animation for team cards
    teamCards.forEach((card, index) => {
        card.style.animationDelay = `${0.2 * index}s`;
    });
});

// Enhanced Logo Animation
document.addEventListener('DOMContentLoaded', function() {
    const logo = document.querySelector('.logo img');
    
    // Add 3D tilt effect on mouse move
    document.querySelector('.logo').addEventListener('mousemove', function(e) {
        const boundingRect = this.getBoundingClientRect();
        const centerX = boundingRect.left + boundingRect.width / 2;
        const centerY = boundingRect.top + boundingRect.height / 2;
        
        const moveX = (e.clientX - centerX) / 10;
        const moveY = (e.clientY - centerY) / 10;
        
        logo.style.transform = `perspective(300px) rotateY(${moveX}deg) rotateX(${-moveY}deg) scale(1.05)`;
    });
    
    // Reset transform on mouse leave
    document.querySelector('.logo').addEventListener('mouseleave', function() {
        logo.style.transform = '';
    });
    
    // Add click animation
    logo.addEventListener('click', function() {
        this.style.animation = 'logoSpin 0.8s ease-out';
        
        setTimeout(() => {
            this.style.animation = 'logoFloat 3s ease-in-out infinite';
        }, 800);
    });
    
    // Reset animation when it ends
    logo.addEventListener('animationend', function(e) {
        if (e.animationName === 'logoSpin') {
            this.style.animation = 'logoFloat 3s ease-in-out infinite';
        }
    });
});

// Example for multiple elements
const hamburgerMenu = document.querySelector('.hamburger-menu');
if (hamburgerMenu) {
    hamburgerMenu.addEventListener('click', function() {
        // Your hamburger menu toggle code
    });
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Form submission code
    });
}

// Get the element and check if it exists before adding event listener
const element = document.getElementById('elementId'); // Replace 'elementId' with your actual element ID
if (element) {
    element.addEventListener('click', function() {
        // Your event handler code
    });
}

// Search dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const searchDropdown = document.querySelector('.search-dropdown');
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        
        // Show dropdown when clicking on search input
        searchInput.addEventListener('click', function() {
            if (searchDropdown) {
                searchDropdown.style.display = 'block';
            }
        });
        
        // Hide dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (searchDropdown && !event.target.closest('.search-bar')) {
                searchDropdown.style.display = 'none';
            }
        });
        
        // Fill search input with dropdown item text when clicked
        if (dropdownItems) {
            dropdownItems.forEach(item => {
                item.addEventListener('click', function() {
                    searchInput.value = this.textContent;
                    if (searchDropdown) {
                        searchDropdown.style.display = 'none';
                    }
                });
            });
        }
    }
});

// After successful login, before redirect:
const welcomePopup = document.getElementById('welcomePopup');
if (welcomePopup) {
    welcomePopup.classList.add('active');
}
