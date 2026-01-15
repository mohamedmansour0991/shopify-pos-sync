<?php
// Debug script to test proxy
header('Content-Type: text/plain');

echo "=== PHP Proxy Debug ===\n\n";
echo "REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'N/A') . "\n";
echo "REQUEST_METHOD: " . ($_SERVER['REQUEST_METHOD'] ?? 'N/A') . "\n";
echo "HTTPS: " . ($_SERVER['HTTPS'] ?? 'N/A') . "\n";
echo "HTTP_HOST: " . ($_SERVER['HTTP_HOST'] ?? 'N/A') . "\n";
echo "CONTENT_TYPE: " . ($_SERVER['CONTENT_TYPE'] ?? 'N/A') . "\n\n";

echo "=== Testing Node.js Connection ===\n";
$ch = curl_init('http://127.0.0.1:3000/');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 2);
$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Error: " . ($error ?: 'None') . "\n";
echo "Response: " . substr($result, 0, 200) . "\n";
?>
