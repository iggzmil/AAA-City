<?php
/**
 * Contact Form Handler for AAA City
 *
 * This script processes contact form submissions from the website
 * and sends emails using the AAA City mail server.
 */

// Include the AAA mail sender
require_once __DIR__ . '/aaa-mail-sender.php';

// Enable error reporting for debugging (comment this out in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set content type for responses
header('Content-Type: application/json');

// Allow any origin for development (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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

// Get the request data based on content type
$requestData = [];

// Log information about the request for debugging
$debugInfo = [
    'method' => $_SERVER['REQUEST_METHOD'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
    'has_post' => !empty($_POST),
    'has_raw_input' => !empty(file_get_contents('php://input'))
];

// Handle GET request (for testing only)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'success' => false,
        'message' => 'This endpoint accepts POST requests only',
        'debug' => $debugInfo
    ]);
    exit;
}

// Process both normal form POST and AJAX JSON POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if this is a JSON request
    if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
        $jsonData = json_decode(file_get_contents('php://input'), true);
        if ($jsonData) {
            $requestData = $jsonData;
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON data',
                'debug' => $debugInfo
            ]);
            exit;
        }
    } else {
        // Regular form POST data
        $requestData = $_POST;
    }

    // If FormData via fetch API
    if (empty($requestData) && !empty($_POST)) {
        $requestData = $_POST;
    }

    // Check if we actually have any data
    if (empty($requestData)) {
        echo json_encode([
            'success' => false,
            'message' => 'No form data received',
            'debug' => $debugInfo
        ]);
        exit;
    }

    // Sanitize input data
    $sanitizedData = [];
    foreach ($requestData as $key => $value) {
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
            'errors' => $errors,
            'debug' => $debugInfo
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
        // Return success
        echo json_encode([
            'success' => true,
            'message' => 'Thank you for your message. We will get back to you shortly.',
            'debug' => $debugInfo
        ]);
    } else {
        // Log the error
        error_log('Failed to send contact form email: ' . $emailResult['message']);

        // Return error
        echo json_encode([
            'success' => false,
            'message' => 'Sorry, we encountered a problem sending your message. Please try again later or contact us directly.',
            'debug' => $emailResult['message'], // Include this in development, remove in production
            'request_info' => $debugInfo
        ]);
    }
} else {
    // Not a supported request method
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method. This endpoint only accepts POST requests.',
        'debug' => $debugInfo
    ]);
} 