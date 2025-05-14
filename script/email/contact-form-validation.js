/**
 * Contact Form Validation for AAA City
 * 
 * Provides enhanced form validation beyond HTML5 attributes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the contact form
    const contactForm = document.getElementById('contact-us-form');

    if (contactForm) {
        // Get form elements
        const nameInput = document.getElementById('user-name');
        const emailInput = document.getElementById('user-email');
        const subjectInput = document.getElementById('msg-subject');
        const messageInput = document.getElementById('msg-text');
        const submitBtn = document.getElementById('submit-btn');
        const allInputs = [nameInput, emailInput, subjectInput, messageInput];
        
        // Show styled validation message
        function showError(input, message) {
            const errorMsgSpan = input.parentElement.querySelector('.error-msg');
            errorMsgSpan.textContent = message;
            errorMsgSpan.style.display = 'block';
            input.classList.add('is-invalid');
        }
        
        // Clear error message
        function clearError(input) {
            const errorMsgSpan = input.parentElement.querySelector('.error-msg');
            errorMsgSpan.textContent = '';
            errorMsgSpan.style.display = 'none';
            input.classList.remove('is-invalid');
        }
        
        // Validate name field (letters, spaces, hyphens, apostrophes)
        function validateName(input) {
            const value = input.value.trim();
            if (value === '') {
                showError(input, 'Name is required');
                return false;
            } else if (value.length < 2) {
                showError(input, 'Name must be at least 2 characters');
                return false;
            } else if (value.length > 50) {
                showError(input, 'Name must be no more than 50 characters');
                return false;
            } else if (!/^[A-Za-z\s\-\']+$/.test(value)) {
                showError(input, 'Name can only contain letters, spaces, hyphens, and apostrophes');
                return false;
            } else {
                clearError(input);
                return true;
            }
        }
        
        // Validate email field
        function validateEmail(input) {
            const value = input.value.trim();
            if (value === '') {
                showError(input, 'Email is required');
                return false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                showError(input, 'Please enter a valid email address');
                return false;
            } else {
                clearError(input);
                return true;
            }
        }
        
        // Validate company/subject field
        function validateSubject(input) {
            const value = input.value.trim();
            if (value === '') {
                showError(input, 'Company name is required');
                return false;
            } else if (value.length < 2) {
                showError(input, 'Company name must be at least 2 characters');
                return false;
            } else if (value.length > 100) {
                showError(input, 'Company name must be no more than 100 characters');
                return false;
            } else {
                clearError(input);
                return true;
            }
        }
        
        // Validate message field
        function validateMessage(input) {
            const value = input.value.trim();
            if (value === '') {
                showError(input, 'Message is required');
                return false;
            } else if (value.length < 10) {
                showError(input, 'Message must be at least 10 characters');
                return false;
            } else if (value.length > 1000) {
                showError(input, 'Message must be no more than 1000 characters');
                return false;
            } else {
                clearError(input);
                return true;
            }
        }
        
        // Validate all form fields
        function validateForm() {
            const isNameValid = validateName(nameInput);
            const isEmailValid = validateEmail(emailInput);
            const isSubjectValid = validateSubject(subjectInput);
            const isMessageValid = validateMessage(messageInput);
            
            return isNameValid && isEmailValid && isSubjectValid && isMessageValid;
        }
        
        // Add input event listeners for real-time validation
        nameInput.addEventListener('input', function() {
            validateName(this);
        });
        
        emailInput.addEventListener('input', function() {
            validateEmail(this);
        });
        
        subjectInput.addEventListener('input', function() {
            validateSubject(this);
        });
        
        messageInput.addEventListener('input', function() {
            validateMessage(this);
        });
        
        // Add blur event listeners for validation when leaving a field
        allInputs.forEach(input => {
            input.addEventListener('blur', function() {
                // Call appropriate validation function based on input ID
                if (this.id === 'user-name') {
                    validateName(this);
                } else if (this.id === 'user-email') {
                    validateEmail(this);
                } else if (this.id === 'msg-subject') {
                    validateSubject(this);
                } else if (this.id === 'msg-text') {
                    validateMessage(this);
                }
            });
        });
        
        // Form submission with enhanced validation
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Always prevent default form submission
            
            // First validate all fields
            const isValid = validateForm();
            
            if (!isValid) {
                // Focus the first input with an error
                const firstInvalidInput = document.querySelector('.is-invalid');
                if (firstInvalidInput) {
                    firstInvalidInput.focus();
                }
                return false;
            }
            
            // Show loading state
            submitBtn.disabled = true;
            const originalButtonText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending...';
            
            // Use AJAX to submit the form
            fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    console.log('Server response status:', response.status);
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalButtonText;
                
                // Handle the response
                handleFormSubmissionResponse(data);
            })
            .catch(error => {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalButtonText;
                
                // Show error message
                alert('The server encountered an error processing your request. Please try again later or contact us directly.');
                console.error('Form submission error:', error);
            });
        });
        
        // Handle successful form submission response
        function handleFormSubmissionResponse(response) {
            if (response.success) {
                // Show success message
                const doneMsg = contactForm.querySelector('.done-msg');
                doneMsg.textContent = response.message;
                doneMsg.classList.add('show');
                
                // Reset form
                contactForm.reset();
                
                // Clear success message after delay
                setTimeout(function() {
                    doneMsg.textContent = '';
                    doneMsg.classList.remove('show');
                }, 5000);
            } else {
                // Show error message
                if (response.errors && Array.isArray(response.errors)) {
                    // Display field-specific errors
                    response.errors.forEach(error => {
                        // Attempt to determine which field the error is for
                        if (error.toLowerCase().includes('name')) {
                            showError(nameInput, error);
                        } else if (error.toLowerCase().includes('email')) {
                            showError(emailInput, error);
                        } else if (error.toLowerCase().includes('company')) {
                            showError(subjectInput, error);
                        } else if (error.toLowerCase().includes('message')) {
                            showError(messageInput, error);
                        }
                    });
                } else {
                    // Display general error message
                    alert(response.message || 'An error occurred. Please try again.');
                }
            }
        }
    }
}); 