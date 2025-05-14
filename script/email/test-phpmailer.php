<?php
/**
 * PHPMailer SMTP Test
 * 
 * This script tests the PHPMailer SMTP configuration without sending an actual email.
 */

// Include the mail sender
require_once __DIR__ . '/aaa-mail-sender.php';

// Set content type for browser output
header('Content-Type: text/plain');

echo "PHPMailer SMTP Test\n";
echo "===================\n\n";

echo "Testing SMTP server: " . AAA_SMTP_HOST . ":" . AAA_SMTP_PORT . "\n";
echo "Authentication: " . AAA_SMTP_USERNAME . "\n\n";

try {
    // Create a new PHPMailer instance
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);

    // Enable debugging
    $mail->SMTPDebug = 3; // Level 3 = debug connection and data
    
    // Redirect debug output to variable
    ob_start();
    
    // Server settings
    $mail->isSMTP();
    $mail->Host       = AAA_SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = AAA_SMTP_USERNAME;
    $mail->Password   = AAA_SMTP_PASSWORD;
    $mail->SMTPSecure = AAA_SMTP_ENCRYPTION;
    $mail->Port       = AAA_SMTP_PORT;
    
    // Disabled SSL verification for testing only
    $mail->SMTPOptions = array(
        'ssl' => array(
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        )
    );
    
    // Connect to the SMTP server
    if ($mail->smtpConnect()) {
        echo "SMTP Connection: SUCCESS\n";
        $mail->smtpClose();
    } else {
        echo "SMTP Connection: FAILED\n";
    }
    
    // Get debugging output
    $debug = ob_get_clean();
    echo "\nDebug Output:\n";
    echo "=============\n";
    echo $debug;
    
} catch (Exception $e) {
    echo "SMTP Test Error: " . $e->getMessage() . "\n";
}

echo "\nTest completed.";

// For testing purposes, try to send a test email if ?send=1 is in the URL
if (isset($_GET['send']) && $_GET['send'] == '1') {
    echo "\n\nAttempting to send a test email...\n";
    
    $result = sendAAAEmail(
        'info@aaa-city.com',
        'Test Email from AAA City Website',
        '<h1>Test Email</h1><p>This is a test email from the AAA City website contact form.</p>',
        'AAA City Test',
        'noreply@aaa-city.com'
    );
    
    echo $result['success'] ? "Email sent successfully!\n" : "Email failed to send: " . $result['message'] . "\n";
}