window.addEventListener('load', () => {
    const loadAnnouncement = document.createElement('div');
    loadAnnouncement.setAttribute('role', 'status');
    loadAnnouncement.setAttribute('aria-live', 'polite');
    loadAnnouncement.className = 'visually-hidden';
    loadAnnouncement.textContent = 'Page loaded successfully. Press Tab to navigate.';
    document.body.appendChild(loadAnnouncement);
    
    setTimeout(() => {
        loadAnnouncement.remove();
    }, 3000);
});

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'alert');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.className = 'visually-hidden';
        
        // Validate required fields
        const requiredFields = contactForm.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.setAttribute('aria-invalid', 'true');
                field.style.borderColor = 'var(--error-color)';
            } else {
                field.setAttribute('aria-invalid', 'false');
                field.style.borderColor = 'var(--border-color)';
            }
        });
        
        if (isValid) {
            announcement.textContent = 'Form submitted successfully! We will contact you soon.';
            document.body.appendChild(announcement);
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: #4caf50;
                color: white;
                padding: 16px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 1000;
                font-weight: 600;
            `;
            successMessage.textContent = '✓ Message sent successfully!';
            document.body.appendChild(successMessage);
            
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
            
            // Reset form
            contactForm.reset();
        } else {
            announcement.textContent = 'Please fill in all required fields marked with an asterisk.';
            document.body.appendChild(announcement);
            
            // Focus first invalid field
            const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
            if (firstInvalid) {
                firstInvalid.focus();
            }
        }
        
        setTimeout(() => {
            announcement.remove();
        }, 5000);
    });
    
    // Clear error state on input
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.value.trim()) {
                input.setAttribute('aria-invalid', 'false');
                input.style.borderColor = 'var(--border-color)';
            }
        });
    });
}

// Newsletter form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'alert');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.className = 'visually-hidden';
        announcement.textContent = 'Successfully subscribed to newsletter!';
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            announcement.remove();
        }, 3000);
        
        newsletterForm.reset();
    });
}

// Smooth scroll with focus management
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Skip if it's the skip link or just '#'
        if (href === '#' || href === '#main-content') {
            return;
        }
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            // Smooth scroll
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Set focus to target for keyboard users
            // Make target focusable temporarily if it's not already
            if (!target.hasAttribute('tabindex')) {
                target.setAttribute('tabindex', '-1');
            }
            
            target.focus();
        }
    });
});

const cards = document.querySelectorAll('.card');
cards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const link = card.querySelector('.card-link');
            if (link) {
                link.click();
            }
        }
    });
});

// Search functionality with keyboard support
const searchInput = document.getElementById('site-search');
const searchBtn = document.querySelector('.search-btn');

if (searchInput && searchBtn) {
    searchBtn.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
}

function performSearch() {
    const query = searchInput.value.trim();
    
    if (query) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'visually-hidden';
        announcement.textContent = `Searching for "${query}". This is a demo, search functionality not implemented.`;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            announcement.remove();
        }, 3000);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'h') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.querySelector('header a').focus();
    }
    
    if (e.altKey && e.key === 'm') {
        e.preventDefault();
        document.getElementById('main-content').focus();
    }
    
    if (e.altKey && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
    }
});

// Trap focus in modal 
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
        
        // Close on Escape
        if (e.key === 'Escape') {
            element.close();
        }
    });
}

// Announce dynamic content changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.hasAttribute('role')) {
                    // Log accessibility roles being added
                    console.log('Accessibility: New element with role:', node.getAttribute('role'));
                }
            });
        }
    });
});

// Observe the document for accessibility
observer.observe(document.body, {
    childList: true,
    subtree: true
});


