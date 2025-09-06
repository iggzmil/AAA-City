<?php
/**
 * AAA City Contact Form Diagnostic Script
 * 
 * This script tests all configuration settings, paths, and dependencies
 * to help troubleshoot the contact form setup.
 */

header('Content-Type: text/plain; charset=utf-8');
echo "=== AAA City Contact Form Diagnostic Test ===\n";
echo "Generated: " . date('Y-m-d H:i:s') . "\n\n";

// 1. Basic PHP Information
echo "1. PHP ENVIRONMENT:\n";
echo "   PHP Version: " . PHP_VERSION . "\n";
echo "   Server Software: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "\n";
echo "   Script Path: " . __FILE__ . "\n";
echo "   Current Working Directory: " . getcwd() . "\n";
echo "   Document Root: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'Not set') . "\n\n";

// 2. File System Paths
echo "2. FILE SYSTEM PATHS:\n";
$basePaths = [
    '__DIR__' => __DIR__,
    '__DIR__ . "/../.."' => __DIR__ . '/../..',
    '__DIR__ . "/../../.."' => __DIR__ . '/../../..',
    '__DIR__ . "/../../../.."' => __DIR__ . '/../../../..',
];

foreach ($basePaths as $label => $path) {
    $realPath = realpath($path);
    echo "   $label: $path\n";
    echo "   Real path: " . ($realPath ? $realPath : 'NOT FOUND') . "\n";
    if ($realPath) {
        echo "   .env exists: " . (file_exists($realPath . '/.env') ? 'YES' : 'NO') . "\n";
        echo "   composer.json exists: " . (file_exists($realPath . '/composer.json') ? 'YES' : 'NO') . "\n";
        echo "   vendor/ exists: " . (is_dir($realPath . '/vendor') ? 'YES' : 'NO') . "\n";
    }
    echo "\n";
}

// 3. Composer and Autoloader
echo "3. COMPOSER & AUTOLOADER:\n";
$autoloaderPaths = [
    __DIR__ . '/../../vendor/autoload.php',
    __DIR__ . '/../../../vendor/autoload.php', 
    __DIR__ . '/../../../../vendor/autoload.php',
];

$autoloaderFound = false;
foreach ($autoloaderPaths as $path) {
    echo "   Checking: $path\n";
    if (file_exists($path)) {
        echo "   Status: FOUND\n";
        try {
            require_once $path;
            echo "   Load test: SUCCESS\n";
            $autoloaderFound = true;
            break;
        } catch (Exception $e) {
            echo "   Load test: FAILED - " . $e->getMessage() . "\n";
        }
    } else {
        echo "   Status: NOT FOUND\n";
    }
}
echo "   Autoloader loaded: " . ($autoloaderFound ? 'YES' : 'NO') . "\n\n";

// 4. Required Classes
echo "4. REQUIRED CLASSES:\n";
$requiredClasses = [
    'PHPMailer\\PHPMailer\\PHPMailer',
    'PHPMailer\\PHPMailer\\Exception',
    'PHPMailer\\PHPMailer\\SMTP',
    'Dotenv\\Dotenv'
];

foreach ($requiredClasses as $class) {
    echo "   $class: " . (class_exists($class) ? 'AVAILABLE' : 'NOT FOUND') . "\n";
}
echo "\n";

// 5. Environment Variables
echo "5. ENVIRONMENT VARIABLES:\n";
$envVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'SMTP_ENCRYPTION'];

// Try to load .env file manually
$envLoaded = false;
foreach ($basePaths as $label => $path) {
    $realPath = realpath($path);
    if ($realPath && file_exists($realPath . '/.env')) {
        echo "   Found .env at: $realPath/.env\n";
        $envContent = file_get_contents($realPath . '/.env');
        echo "   .env content preview:\n";
        $lines = explode("\n", $envContent);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line && !str_starts_with($line, '#')) {
                // Hide password values for security
                if (str_contains($line, 'PASSWORD')) {
                    $parts = explode('=', $line, 2);
                    echo "     " . $parts[0] . "=***HIDDEN***\n";
                } else {
                    echo "     $line\n";
                }
            }
        }
        echo "\n";
        
        // Try to load with Dotenv if available
        if (class_exists('Dotenv\\Dotenv')) {
            try {
                $dotenv = \Dotenv\Dotenv::createImmutable($realPath);
                $dotenv->load();
                $envLoaded = true;
                echo "   Dotenv load: SUCCESS\n";
            } catch (Exception $e) {
                echo "   Dotenv load: FAILED - " . $e->getMessage() . "\n";
            }
        }
        break;
    }
}

echo "   Environment loaded: " . ($envLoaded ? 'YES' : 'NO') . "\n";

foreach ($envVars as $var) {
    $value = $_ENV[$var] ?? getenv($var) ?? 'NOT SET';
    if ($var === 'SMTP_PASSWORD' && $value !== 'NOT SET') {
        $value = '***HIDDEN***';
    }
    echo "   $var: $value\n";
}
echo "\n";

// 6. PHPMailer Direct Test
echo "6. PHPMAILER DIRECT TEST:\n";
if (class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        echo "   PHPMailer instantiation: SUCCESS\n";
        
        // Test SMTP settings
        $smtpHost = $_ENV['SMTP_HOST'] ?? 'mail.aaa-city.com';
        $smtpPort = $_ENV['SMTP_PORT'] ?? 587;
        $smtpUsername = $_ENV['SMTP_USERNAME'] ?? 'smtpmailer@aaa-city.com';
        $smtpPassword = $_ENV['SMTP_PASSWORD'] ?? 'Password4SMTPMailer';
        $smtpEncryption = $_ENV['SMTP_ENCRYPTION'] ?? 'tls';
        
        echo "   SMTP Host: $smtpHost\n";
        echo "   SMTP Port: $smtpPort\n";
        echo "   SMTP Username: $smtpUsername\n";
        echo "   SMTP Password: ***HIDDEN***\n";
        echo "   SMTP Encryption: $smtpEncryption\n";
        
    } catch (Exception $e) {
        echo "   PHPMailer instantiation: FAILED - " . $e->getMessage() . "\n";
    }
} else {
    echo "   PHPMailer: NOT AVAILABLE\n";
}
echo "\n";

// 7. File Permissions
echo "7. FILE PERMISSIONS:\n";
$filesToCheck = [
    __FILE__,
    __DIR__ . '/aaa-contact-form-handler.php',
    __DIR__ . '/aaa-mail-sender.php'
];

foreach ($filesToCheck as $file) {
    if (file_exists($file)) {
        $perms = fileperms($file);
        $octal = substr(sprintf('%o', $perms), -4);
        echo "   " . basename($file) . ": $octal " . (is_readable($file) ? '(readable)' : '(not readable)') . "\n";
    } else {
        echo "   " . basename($file) . ": FILE NOT FOUND\n";
    }
}
echo "\n";

// 8. Server Configuration
echo "8. SERVER CONFIGURATION:\n";
echo "   allow_url_fopen: " . (ini_get('allow_url_fopen') ? 'YES' : 'NO') . "\n";
echo "   openssl extension: " . (extension_loaded('openssl') ? 'YES' : 'NO') . "\n";
echo "   curl extension: " . (extension_loaded('curl') ? 'YES' : 'NO') . "\n";
echo "   mbstring extension: " . (extension_loaded('mbstring') ? 'YES' : 'NO') . "\n";
echo "   max_execution_time: " . ini_get('max_execution_time') . "\n";
echo "   memory_limit: " . ini_get('memory_limit') . "\n";
echo "   post_max_size: " . ini_get('post_max_size') . "\n";
echo "   upload_max_filesize: " . ini_get('upload_max_filesize') . "\n\n";

// 9. Test Form Data Processing
echo "9. FORM DATA TEST:\n";
$testData = [
    'user-name' => 'Test User',
    'user-email' => 'test@example.com',
    'msg-subject' => 'Test Company',
    'msg-text' => 'This is a test message for diagnostics.',
    'form-start-time' => (string)(time() * 1000)
];

echo "   Test form data:\n";
foreach ($testData as $key => $value) {
    echo "     $key: $value\n";
}

// Test validation functions if they exist
if (function_exists('validateContactForm')) {
    echo "   validateContactForm function: AVAILABLE\n";
} else {
    echo "   validateContactForm function: NOT AVAILABLE\n";
}

if (function_exists('createContactEmailHtml')) {
    echo "   createContactEmailHtml function: AVAILABLE\n";
} else {
    echo "   createContactEmailHtml function: NOT AVAILABLE\n";
}

if (function_exists('sendAAAEmail')) {
    echo "   sendAAAEmail function: AVAILABLE\n";
} else {
    echo "   sendAAAEmail function: NOT AVAILABLE\n";
}
echo "\n";

echo "=== END DIAGNOSTIC TEST ===\n";
echo "Please copy this entire output and provide it for troubleshooting.\n";
?>