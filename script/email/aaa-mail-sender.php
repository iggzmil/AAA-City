<?php
/**
 * Mail Sender for AAA City
 *
 * This file provides functionality to send emails using the AAA City mail server
 * via SMTP authentication.
 */

/**
 * Send an email using AAA City mail server via SMTP
 *
 * @param string $to Email recipient(s) - can be a single email or multiple comma-separated emails
 * @param string $subject Email subject
 * @param string $message Email message body (HTML)
 * @param string $fromName Sender name
 * @param array $attachments Optional array of attachments with 'path' and 'name' keys
 * @return array Result with 'success' boolean and 'message' string
 */
function sendAAAEmail($to, $subject, $message, $fromName = 'AAA City', $attachments = []) {
    $result = [
        'success' => false,
        'message' => ''
    ];

    try {
        // SMTP server settings
        $smtpServer = 'mail.aaa-city.com';
        $smtpPort = 587; // Use 587 for TLS or 465 for SSL
        $smtpUsername = 'smtpmailer@aaa-city.com';
        $smtpPassword = 'SMTPMa1l3r';
        $fromEmail = 'smtpmailer@aaa-city.com';
        $useTLS = true; // Use TLS encryption

        // Generate a unique boundary for MIME parts
        $boundary = md5(time());
        $boundaryMixed = 'mixed_' . $boundary;
        $boundaryAlternative = 'alt_' . $boundary;

        // Format recipient(s)
        $toAddresses = explode(',', $to);
        $to = trim($toAddresses[0]); // Primary recipient
        
        // Set headers
        $headers = [
            'From' => "{$fromName} <{$fromEmail}>",
            'MIME-Version' => '1.0',
            'Content-Type' => "multipart/mixed; boundary=\"{$boundaryMixed}\"",
            'Date' => date('r'),
            'X-Mailer' => 'PHP/' . phpversion(),
        ];

        // Add CC recipients if multiple recipients
        if (count($toAddresses) > 1) {
            $ccAddresses = array_slice($toAddresses, 1);
            $headers['Cc'] = implode(', ', $ccAddresses);
        }

        // Create email body
        $body = "--{$boundaryMixed}\r\n";
        $body .= "Content-Type: multipart/alternative; boundary=\"{$boundaryAlternative}\"\r\n\r\n";
        
        // Text version
        $body .= "--{$boundaryAlternative}\r\n";
        $body .= "Content-Type: text/plain; charset=utf-8\r\n";
        $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $body .= strip_tags(preg_replace('/<br\s*\/?>/', "\n", $message)) . "\r\n\r\n";
        
        // HTML version
        $body .= "--{$boundaryAlternative}\r\n";
        $body .= "Content-Type: text/html; charset=utf-8\r\n";
        $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $body .= $message . "\r\n\r\n";
        
        // Close alternative boundary
        $body .= "--{$boundaryAlternative}--\r\n\r\n";
        
        // Add attachments if any
        if (!empty($attachments)) {
            foreach ($attachments as $attachment) {
                if (!isset($attachment['path']) || !file_exists($attachment['path'])) {
                    continue;
                }
                
                $filename = isset($attachment['name']) ? $attachment['name'] : basename($attachment['path']);
                $content = file_get_contents($attachment['path']);
                $mimeType = mime_content_type($attachment['path']) ?: 'application/octet-stream';
                
                $body .= "--{$boundaryMixed}\r\n";
                $body .= "Content-Type: {$mimeType}; name=\"{$filename}\"\r\n";
                $body .= "Content-Disposition: attachment; filename=\"{$filename}\"\r\n";
                $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
                $body .= chunk_split(base64_encode($content)) . "\r\n\r\n";
            }
        }
        
        // Close mixed boundary
        $body .= "--{$boundaryMixed}--\r\n";
        
        // Format headers for mail function
        $formattedHeaders = '';
        foreach ($headers as $name => $value) {
            $formattedHeaders .= "{$name}: {$value}\r\n";
        }
        
        // Connect to SMTP server
        $smtp = fsockopen(($useTLS ? 'tls://' : '') . $smtpServer, $smtpPort, $errno, $errstr, 30);
        
        if (!$smtp) {
            throw new Exception("Failed to connect to SMTP server: {$errstr} ({$errno})");
        }
        
        // Check connection response
        if (!checkSMTPResponse($smtp, '220')) {
            fclose($smtp);
            throw new Exception("SMTP server did not respond with 220 greeting");
        }
        
        // Send EHLO command
        fwrite($smtp, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
        if (!checkSMTPResponse($smtp, '250')) {
            fclose($smtp);
            throw new Exception("SMTP EHLO failed");
        }
        
        // Authenticate with server
        fwrite($smtp, "AUTH LOGIN\r\n");
        if (!checkSMTPResponse($smtp, '334')) {
            fclose($smtp);
            throw new Exception("SMTP AUTH LOGIN failed");
        }
        
        // Send username (base64 encoded)
        fwrite($smtp, base64_encode($smtpUsername) . "\r\n");
        if (!checkSMTPResponse($smtp, '334')) {
            fclose($smtp);
            throw new Exception("SMTP username rejected");
        }
        
        // Send password (base64 encoded)
        fwrite($smtp, base64_encode($smtpPassword) . "\r\n");
        if (!checkSMTPResponse($smtp, '235')) {
            fclose($smtp);
            throw new Exception("SMTP authentication failed - check username/password");
        }
        
        // Send MAIL FROM command
        fwrite($smtp, "MAIL FROM:<{$fromEmail}>\r\n");
        if (!checkSMTPResponse($smtp, '250')) {
            fclose($smtp);
            throw new Exception("SMTP MAIL FROM failed");
        }
        
        // Send RCPT TO command for each recipient
        foreach ($toAddresses as $toEmail) {
            $toEmail = trim($toEmail);
            if (!empty($toEmail)) {
                fwrite($smtp, "RCPT TO:<{$toEmail}>\r\n");
                // Note: Some servers may reject certain recipients but still accept the email for others
                checkSMTPResponse($smtp, '250', false); // Don't throw exception here
            }
        }
        
        // Start data transmission
        fwrite($smtp, "DATA\r\n");
        if (!checkSMTPResponse($smtp, '354')) {
            fclose($smtp);
            throw new Exception("SMTP DATA command failed");
        }
        
        // Send email headers and body
        fwrite($smtp, "To: {$to}\r\n");
        fwrite($smtp, $formattedHeaders);
        fwrite($smtp, "Subject: {$subject}\r\n");
        fwrite($smtp, "\r\n");
        fwrite($smtp, $body);
        fwrite($smtp, "\r\n.\r\n"); // End of data marker
        
        if (!checkSMTPResponse($smtp, '250')) {
            fclose($smtp);
            throw new Exception("SMTP failed to accept email");
        }
        
        // Send QUIT command
        fwrite($smtp, "QUIT\r\n");
        fclose($smtp);
        
        // Email sent successfully
        $result['success'] = true;
        $result['message'] = 'Email sent successfully';
        $result['id'] = md5(time() . $to . $subject); // Generate a pseudo-ID

    } catch (Exception $e) {
        $result['message'] = 'Failed to send email: ' . $e->getMessage();
        error_log('AAA Mail Server error: ' . $e->getMessage());
        
        // Fallback to PHP mail() function if SMTP fails
        if (function_exists('mail')) {
            $headers = "From: {$fromName} <{$fromEmail}>\r\n";
            $headers .= "Reply-To: {$fromEmail}\r\n";
            $headers .= "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
            $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

            $mailResult = mail($to, $subject, $message, $headers);

            if ($mailResult) {
                $result['success'] = true;
                $result['message'] = 'Email sent successfully using PHP mail() function (fallback mode)';
            } else {
                $result['message'] .= ' - And PHP mail() function also failed';
            }
        }
    }

    return $result;
}

/**
 * Helper function to check SMTP response codes
 */
function checkSMTPResponse($socket, $expectedCode, $throwException = true) {
    $response = '';
    while ($line = fgets($socket, 515)) {
        $response .= $line;
        // If we get a line that doesn't start with the expected code and it's the last line (doesn't end with -)
        if (substr($line, 0, 3) !== $expectedCode && substr($line, 3, 1) !== '-') {
            // If we should throw an exception
            if ($throwException) {
                throw new Exception("Unexpected SMTP response: " . trim($response));
            }
            return false;
        }
        // If this is the last line (doesn't end with -)
        if (substr($line, 3, 1) !== '-') {
            break;
        }
    }
    return true;
}

/**
 * Create an HTML email with the contact form data
 */
function createContactEmailHtml($data) {
    $name = htmlspecialchars($data['user-name'] ?? '');
    $email = htmlspecialchars($data['user-email'] ?? '');
    $company = htmlspecialchars($data['msg-subject'] ?? '');
    $message = nl2br(htmlspecialchars($data['msg-text'] ?? ''));

    // Create HTML email
    $html = <<<HTML
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
        .contact-details {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .message-content {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
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
        <h1>New Contact Form Submission</h1>

        <div class="contact-details">
            <p><strong>Name:</strong> {$name}</p>
            <p><strong>Email:</strong> {$email}</p>
            <p><strong>Company:</strong> {$company}</p>
        </div>

        <div class="message-content">
            <h3>Message:</h3>
            <p>{$message}</p>
        </div>

        <div class="footer">
            <p>This message was sent from the AAA City website contact form.</p>
            <p>© AAA City</p>
        </div>
    </div>
</body>
</html>
HTML;

    return $html;
}

// API endpoint handler if file is accessed directly
if (basename($_SERVER['SCRIPT_FILENAME']) == basename(__FILE__)) {
    header('Content-Type: application/json');

    // Check if it's a POST request
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        if (!isset($data['to']) || !isset($data['subject']) || !isset($data['message'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Missing required fields (to, subject, message)'
            ]);
            exit;
        }

        // Send email
        $result = sendAAAEmail(
            $data['to'],
            $data['subject'],
            $data['message'],
            $data['fromName'] ?? 'AAA City',
            $data['attachments'] ?? []
        );

        // Return result
        echo json_encode($result);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'This endpoint only accepts POST requests'
        ]);
    }
} 