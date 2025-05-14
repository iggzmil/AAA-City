<?php
/**
 * Test Script for AAA City Mail Server
 *
 * This script tests the mail server configuration by sending a test email.
 * Run this script from the command line or browser to verify email functionality.
 */

// Include the AAA mail sender
require_once __DIR__ . '/aaa-mail-sender.php';

// Enable error reporting for testing
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Function to format output based on request type
function output($message, $isError = false) {
    if (php_sapi_name() === 'cli') {
        echo ($isError ? "ERROR: " : "") . $message . PHP_EOL;
    } else {
        echo "<p" . ($isError ? " style='color: red;'" : "") . ">" . htmlspecialchars($message) . "</p>";
    }
}

// Create HTML test message
function createTestHtml() {
    $timestamp = date('Y-m-d H:i:s');
    
    return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        h1 {
            color: #0576ee;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        .content {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Test Email from AAA City</h1>

        <div class="content">
            <p>This is a test email sent from the AAA City website.</p>
            <p>Time of test: {$timestamp}</p>
            <p>If you received this email, your mail configuration is working correctly!</p>
        </div>

        <div class="footer">
            <p>© AAA City</p>
        </div>
    </div>
</body>
</html>
HTML;
}

// HTTP or CLI header
if (php_sapi_name() !== 'cli') {
    echo "<!DOCTYPE html><html><head><title>AAA Mail Test</title></head><body>";
    echo "<h1>AAA Mail Server Test</h1>";
}

// Recipient email address - always use the production recipient
$recipientEmail = 'info@aaa-city.com';

// Test email settings
$subject = 'AAA.City Contact Form Submission';
$message = createTestHtml();
$fromName = 'AAA City Website';

// Output test information
output("Sending test email to: " . $recipientEmail);
output("Using SMTP server: mail.aaa-city.com");
output("Using SMTP port: 587 (TLS)");
output("Using SMTP authentication: smtpmailer@aaa-city.com");
output("Testing connection...");

// Send test email
$result = sendAAAEmail(
    $recipientEmail,
    $subject,
    $message,
    $fromName
);

// Output result
if ($result['success']) {
    output("Email sent successfully!");
    output("Message ID: " . ($result['id'] ?? 'N/A'));
} else {
    output("Failed to send email: " . $result['message'], true);
}

// End of HTML output
if (php_sapi_name() !== 'cli') {
    echo "<p>To test with a different email address, add ?email=your@email.com to the URL.</p>";
    echo "</body></html>";
} 