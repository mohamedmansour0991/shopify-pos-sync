<?php
/**
 * Test script to debug index.php proxy issues
 */
header('Content-Type: text/plain');

echo "=== Testing index.php Proxy ===\n\n";

// Simulate what index.php does
$targetUrl = 'http://127.0.0.1:3000/';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-Forwarded-Proto: https',
    'X-Forwarded-Host: shopify-pos.tek-part.com',
    'Host: shopify-pos.tek-part.com'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Error: " . ($error ?: 'None') . "\n";
echo "Header Size: $headerSize\n";
echo "Response Length: " . strlen($response) . "\n\n";

if ($response) {
    $responseHeaders = substr($response, 0, $headerSize);
    $responseBody = substr($response, $headerSize);
    
    echo "=== Headers ===\n";
    echo $responseHeaders . "\n";
    
    echo "=== Body (first 500 chars) ===\n";
    echo substr($responseBody, 0, 500) . "\n";
} else {
    echo "No response received\n";
}
?>
