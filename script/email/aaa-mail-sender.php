<?php
/**
 * AAA City Mail Sender
 * 
 * Uses PHPMailer to send emails through the AAA City SMTP server
 */

// Check if autoloader was already loaded (it should be by aaa-contact-form-handler.php)
// If not, try to load it (for standalone usage)
if (!class_exists('Dotenv\Dotenv')) {
    $autoloaderPaths = [
        __DIR__ . '/../../vendor/autoload.php',
        __DIR__ . '/../../../vendor/autoload.php', 
        __DIR__ . '/../../../../vendor/autoload.php',
    ];
    
    $autoloaderLoaded = false;
    foreach ($autoloaderPaths as $autoloaderPath) {
        if (file_exists($autoloaderPath)) {
            require_once $autoloaderPath;
            $autoloaderLoaded = true;
            break;
        }
    }
    
    // If no Composer autoloader found, load PHPMailer classes directly
    if (!$autoloaderLoaded) {
        require_once __DIR__ . '/PHPMailer/Exception.php';
        require_once __DIR__ . '/PHPMailer/PHPMailer.php';
        require_once __DIR__ . '/PHPMailer/SMTP.php';
    }
}

// Load environment variables if Dotenv class is available
if (class_exists('Dotenv\Dotenv')) {
    
    // Try different paths for .env file
    $envPaths = [
        __DIR__ . '/../../',        // Standard location
        __DIR__ . '/../../../',     // Alternative location  
        __DIR__ . '/../../../../',  // Root level
    ];
    
    foreach ($envPaths as $envPath) {
        if (file_exists($envPath . '.env')) {
            try {
                $dotenv = \Dotenv\Dotenv::createImmutable($envPath);
                $dotenv->load();
                $dotenv->required(['SMTP_HOST', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'SMTP_ENCRYPTION']);
                break;
            } catch (Exception $e) {
                // Continue to next path if this one fails
                continue;
            }
        }
    }
    
    // Define constants from environment variables
    define('AAA_SMTP_HOST', $_ENV['SMTP_HOST']);
    define('AAA_SMTP_PORT', (int)$_ENV['SMTP_PORT']);
    define('AAA_SMTP_USERNAME', $_ENV['SMTP_USERNAME']);
    define('AAA_SMTP_PASSWORD', $_ENV['SMTP_PASSWORD']);
    define('AAA_SMTP_ENCRYPTION', $_ENV['SMTP_ENCRYPTION']);
} else {
    // Fallback: Load from server environment variables or use defaults
    define('AAA_SMTP_HOST', $_ENV['SMTP_HOST'] ?? getenv('SMTP_HOST') ?? 'mail.aaa-city.com');
    define('AAA_SMTP_PORT', (int)($_ENV['SMTP_PORT'] ?? getenv('SMTP_PORT') ?? 587));
    define('AAA_SMTP_USERNAME', $_ENV['SMTP_USERNAME'] ?? getenv('SMTP_USERNAME') ?? 'smtpmailer@aaa-city.com');
    define('AAA_SMTP_PASSWORD', $_ENV['SMTP_PASSWORD'] ?? getenv('SMTP_PASSWORD') ?? 'SMTPMa1l3r');
    define('AAA_SMTP_ENCRYPTION', $_ENV['SMTP_ENCRYPTION'] ?? getenv('SMTP_ENCRYPTION') ?? 'tls');
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

/**
 * Create HTML email content for contact form submissions
 * 
 * @param array $formData The sanitized form data
 * @return string HTML email content
 */
function createContactEmailHtml($formData) {
    // Get form data using current field names
    $name = isset($formData['user-name']) ? htmlspecialchars($formData['user-name']) : 'Not provided';
    $email = isset($formData['user-email']) ? htmlspecialchars($formData['user-email']) : 'Not provided';
    $company = isset($formData['msg-subject']) ? htmlspecialchars($formData['msg-subject']) : 'Not provided';
    $message = isset($formData['msg-text']) ? nl2br(htmlspecialchars($formData['msg-text'])) : 'Not provided';
    
    // Create HTML email content with AAA City branding
    $html = '
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact Form Submission</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0066cc; color: white; padding: 10px 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #333; }
            .value { color: #333; margin: 0; }
            .footer { font-size: 12px; text-align: center; margin-top: 20px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>AAA.City Contact Form Submission</h2>
            </div>
            <div class="content">
                <div class="field">
                    <p class="label">Name:</p>
                    <p class="value">' . $name . '</p>
                </div>
                <div class="field">
                    <p class="label">Email:</p>
                    <p class="value">' . $email . '</p>
                </div>
                <div class="field">
                    <p class="label">Company:</p>
                    <p class="value">' . $company . '</p>
                </div>
                <div class="field">
                    <p class="label">Message:</p>
                    <p class="value">' . $message . '</p>
                </div>
            </div>
            <div class="footer">
                <p>This email was sent from the AAA.City website contact form.</p>
            </div>
        </div>
    </body>
    </html>
    ';
    
    return $html;
}

/**
 * Send an email using the AAA SMTP server
 *
 * @param string $to Recipient email address
 * @param string $subject Email subject
 * @param string $htmlBody HTML email body content
 * @param string $fromName Display name for the sender
 * @param string $replyTo Optional reply-to email address
 * @return array Result with success flag and message
 */
function sendAAAEmail($to, $subject, $htmlBody, $fromName = 'AAA City Website', $replyTo = '') {
    // Create a new PHPMailer instance
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->SMTPDebug = 0;                      // 0 = off, 1 = client messages, 2 = client and server messages
        $mail->isSMTP();                           // Send using SMTP
        $mail->Host       = AAA_SMTP_HOST;         // Set the SMTP server
        $mail->SMTPAuth   = true;                  // Enable SMTP authentication
        $mail->Username   = AAA_SMTP_USERNAME;     // SMTP username
        $mail->Password   = AAA_SMTP_PASSWORD;     // SMTP password
        $mail->SMTPSecure = AAA_SMTP_ENCRYPTION;   // Enable TLS encryption
        $mail->Port       = AAA_SMTP_PORT;         // TCP port to connect to (587 for TLS)

        // Recipients
        $mail->setFrom(AAA_SMTP_USERNAME, $fromName);
        $mail->addAddress($to);                    // Add a recipient
        
        // Add reply-to if provided
        if (!empty($replyTo)) {
            $mail->addReplyTo($replyTo);
        }

        // Content
        $mail->isHTML(true);                       // Set email format to HTML
        $mail->Subject = $subject;
        $mail->Body    = $htmlBody;
        
        // Generate plain text version from HTML
        $mail->AltBody = strip_tags(str_replace('<br>', "\n", $htmlBody));
        
        // Send the email
        $mail->send();
        
        return [
            'success' => true,
            'message' => 'Email sent successfully'
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => "Email could not be sent. Mailer Error: {$mail->ErrorInfo}"
        ];
    }
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
            $data['replyTo'] ?? ''
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
?>