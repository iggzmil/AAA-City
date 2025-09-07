<?php
/**
 * Security Headers Test Script
 * Tests if security headers are properly implemented
 */

$testUrl = 'https://www.aaa-city.com';
$apiTestUrl = 'https://www.aaa-city.com/script/email/aaa-contact-form-handler.php';

function testHeaders($url, $description) {
    echo "\n=== Testing: $description ===\n";
    echo "URL: $url\n";
    echo str_repeat("-", 50) . "\n";
    
    // Initialize cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_NOBODY, true); // HEAD request only
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For testing only
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_error($ch)) {
        echo "❌ ERROR: " . curl_error($ch) . "\n";
        curl_close($ch);
        return;
    }
    
    curl_close($ch);
    
    echo "HTTP Status: $httpCode\n\n";
    
    if ($httpCode !== 200) {
        echo "⚠️ Non-200 status code received\n";
    }
    
    // Parse headers
    $headers = [];
    $lines = explode("\n", $response);
    foreach ($lines as $line) {
        if (strpos($line, ':') !== false) {
            list($key, $value) = explode(':', $line, 2);
            $headers[strtolower(trim($key))] = trim($value);
        }
    }
    
    // Test security headers
    $securityHeaders = [
        'x-frame-options' => ['expected' => 'DENY', 'description' => 'Clickjacking Protection'],
        'x-content-type-options' => ['expected' => 'nosniff', 'description' => 'MIME Sniffing Protection'],
        'x-xss-protection' => ['expected' => '1; mode=block', 'description' => 'XSS Protection'],
        'referrer-policy' => ['expected' => 'strict-origin-when-cross-origin', 'description' => 'Referrer Policy'],
        'strict-transport-security' => ['expected' => null, 'description' => 'HTTPS Enforcement'],
        'permissions-policy' => ['expected' => null, 'description' => 'Browser Permissions'],
        'content-security-policy' => ['expected' => null, 'description' => 'Content Security Policy']
    ];
    
    foreach ($securityHeaders as $header => $info) {
        if (isset($headers[$header])) {
            $value = $headers[$header];
            if ($info['expected'] && $value === $info['expected']) {
                echo "✅ $header: $value\n";
            } elseif ($info['expected'] === null) {
                echo "✅ $header: " . substr($value, 0, 80) . "...\n";
            } else {
                echo "⚠️ $header: $value (expected: {$info['expected']})\n";
            }
        } else {
            echo "❌ $header: MISSING\n";
        }
    }
    
    return $headers;
}

// Test main website
$mainHeaders = testHeaders($testUrl, "Main Website (HTML)");

// Test API endpoint
$apiHeaders = testHeaders($apiTestUrl, "API Endpoint (PHP)");

// Summary
echo "\n" . str_repeat("=", 50) . "\n";
echo "SECURITY HEADERS SUMMARY\n";
echo str_repeat("=", 50) . "\n";

$requiredHeaders = ['x-frame-options', 'x-content-type-options', 'strict-transport-security', 'content-security-policy'];
$mainScore = 0;
$apiScore = 0;

foreach ($requiredHeaders as $header) {
    $mainHas = isset($mainHeaders[$header]);
    $apiHas = isset($apiHeaders[$header]);
    
    echo sprintf("%-25s Main: %s | API: %s\n", 
        ucwords(str_replace('-', ' ', $header)), 
        $mainHas ? '✅' : '❌',
        $apiHas ? '✅' : '❌'
    );
    
    if ($mainHas) $mainScore++;
    if ($apiHas) $apiScore++;
}

echo "\nSecurity Score:\n";
echo "Main Website: $mainScore/" . count($requiredHeaders) . "\n";
echo "API Endpoint: $apiScore/" . count($requiredHeaders) . "\n";

if ($mainScore === count($requiredHeaders) && $apiScore === count($requiredHeaders)) {
    echo "\n🎉 All security headers are properly configured!\n";
} else {
    echo "\n⚠️ Some security headers are missing. Check configuration.\n";
}

// Test online tools recommendation
echo "\n" . str_repeat("-", 50) . "\n";
echo "For comprehensive testing, also check:\n";
echo "• https://securityheaders.com/?q=" . urlencode($testUrl) . "\n";
echo "• https://observatory.mozilla.org/analyze/" . parse_url($testUrl, PHP_URL_HOST) . "\n";
echo str_repeat("-", 50) . "\n";
?>