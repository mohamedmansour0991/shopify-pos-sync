<?php
/**
 * Test script to verify /auth/login routing
 */

// Get the request URI
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$uriWithoutQuery = parse_url($requestUri, PHP_URL_PATH) ?: '/';

echo "=== Testing /auth/login routing ===\n";
echo "REQUEST_URI: " . $requestUri . "\n";
echo "URI without query: " . $uriWithoutQuery . "\n";
echo "\n";

// Test direct connection to Node.js
$targetUrl = 'http://127.0.0.1:3000' . $uriWithoutQuery;
echo "Target URL: " . $targetUrl . "\n";
echo "\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_NOBODY, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: " . $httpCode . "\n";
if ($error) {
    echo "Error: " . $error . "\n";
} else {
    echo "Success: Route is accessible from Node.js\n";
}
echo "\n";

// Test if .htaccess is working
echo "=== Testing .htaccess ===\n";
if (isset($_SERVER['REQUEST_URI'])) {
    echo ".htaccess is working - REQUEST_URI is set\n";
} else {
    echo ".htaccess may not be working - REQUEST_URI is not set\n";
}
echo "\n";

// Show all relevant server variables
echo "=== Server Variables ===\n";
echo "SCRIPT_NAME: " . ($_SERVER['SCRIPT_NAME'] ?? 'N/A') . "\n";
echo "PHP_SELF: " . ($_SERVER['PHP_SELF'] ?? 'N/A') . "\n";
echo "REQUEST_METHOD: " . ($_SERVER['REQUEST_METHOD'] ?? 'N/A') . "\n";
?>
