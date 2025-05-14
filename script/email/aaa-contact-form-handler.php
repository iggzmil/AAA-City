<?php
/**
 * Contact Form Handler for AAA City
 *
 * This script processes contact form submissions from the website
 * and sends emails using the AAA City mail server.
 */

// Include the AAA mail sender
require_once __DIR__ . '/aaa-mail-sender.php';

// Set content type for AJAX responses
header('Content-Type: application/json');

// Function to validate form data
function validateContactForm($data) {
    $errors = [];

    // Required fields
    $requiredFields = ['user-name', 'user-email', 'msg-subject', 'msg-text'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            $errors[] = ucfirst(str_replace('-', ' ', $field)) . ' is required';
        }
    }

    // Name validation
    if (isset($data['user-name']) && !empty($data['user-name'])) {
        $name = trim($data['user-name']);

        // Check length
        if (strlen($name) < 2) {
            $errors[] = 'Name must be at least 2 characters';
        } elseif (strlen($name) > 50) {
            $errors[] = 'Name must be no more than 50 characters';
        }

        // Check for valid characters (letters, spaces, hyphens, apostrophes)
        if (!preg_match('/^[A-Za-z\s\-\']+$/', $name)) {
            $errors[] = 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }
    }

    // Email validation
    if (isset($data['user-email']) && !empty($data['user-email'])) {
        $email = trim($data['user-email']);

        // Basic email validation
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Please enter a valid email address';
        }

        // Additional email validation (domain check)
        $parts = explode('@', $email);
        if (count($parts) === 2) {
            $domain = $parts[1];
            if (!checkdnsrr($domain, 'MX') && !checkdnsrr($domain, 'A')) {
                $errors[] = 'Email domain appears to be invalid';
            }
        }
    }

    // Subject validation
    if (isset($data['msg-subject']) && !empty($data['msg-subject'])) {
        $subject = trim($data['msg-subject']);

        // Check length
        if (strlen($subject) < 2) {
            $errors[] = 'Company name must be at least 2 characters';
        } elseif (strlen($subject) > 100) {
            $errors[] = 'Company name must be no more than 100 characters';
        }
    }

    // Message validation
    if (isset($data['msg-text']) && !empty($data['msg-text'])) {
        $message = trim($data['msg-text']);

        // Check length
        if (strlen($message) < 10) {
            $errors[] = 'Message must be at least 10 characters';
        } elseif (strlen($message) > 1000) {
            $errors[] = 'Message must be no more than 1000 characters';
        }
    }

    return $errors;
}

// Process the form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Rate limiting - prevent spam submissions
    session_start();
    $currentTime = time();
    $lastSubmissionTime = isset($_SESSION['last_form_submission']) ? $_SESSION['last_form_submission'] : 0;

    // Allow only one submission every 60 seconds
    if (($currentTime - $lastSubmissionTime) < 60) {
        echo json_encode([
            'success' => false,
            'message' => 'Please wait a moment before submitting another message.'
        ]);
        exit;
    }

    // Sanitize input data
    $sanitizedData = [];
    foreach ($_POST as $key => $value) {
        // Sanitize string values
        if (is_string($value)) {
            $sanitizedData[$key] = trim(strip_tags($value));
        } else {
            $sanitizedData[$key] = $value;
        }
    }

    // Validate form data
    $errors = validateContactForm($sanitizedData);

    if (!empty($errors)) {
        // Format the error message to be more user-friendly
        $errorMessage = 'Please correct the following issues:';

        // Return the detailed error information
        echo json_encode([
            'success' => false,
            'message' => $errorMessage,
            'errors' => $errors
        ]);
        exit;
    }

    // Create HTML email content
    $emailHtml = createContactEmailHtml($sanitizedData);

    // Set the recipient email
    $recipientEmail = 'info@aaa-city.com'; // Send all form submissions to this email
    
    // Set the subject format
    $emailSubject = 'AAA.City Contact Form Submission';

    // Send the email
    $emailResult = sendAAAEmail(
        $recipientEmail,
        $emailSubject,
        $emailHtml,
        'AAA City Website'
    );

    if ($emailResult['success']) {
        // Update last submission time
        $_SESSION['last_form_submission'] = $currentTime;

        // Return success
        echo json_encode([
            'success' => true,
            'message' => 'Thank you for your message. We will get back to you shortly.'
        ]);
    } else {
        // Log the error
        error_log('Failed to send contact form email: ' . $emailResult['message']);

        // Return error
        echo json_encode([
            'success' => false,
            'message' => 'Sorry, we encountered a problem sending your message. Please try again later or contact us directly.',
            'debug' => $emailResult['message'] // Include this in development, remove in production
        ]);
    }
} else {
    // Not a POST request
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method. This endpoint only accepts POST requests.'
    ]);
} 