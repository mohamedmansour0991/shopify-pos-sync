<?php
/**
 * Test script to directly test the proxy functionality
 */
header('Content-Type: text/plain');

echo "=== Testing Direct Proxy ===\n\n";

$targetUrl = 'http://127.0.0.1:3000/';
$requestMethod = 'GET';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $requestMethod);
curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);

// Only essential headers - NO Content-Type or Content-Length for GET
$headers = [
    'X-Forwarded-Proto: https',
    'X-Forwarded-Host: theonesystemco.tek-part.com',
    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language: en-US,en;q=0.5',
    'Accept-Encoding: gzip, deflate',
    'Connection: keep-alive',
    'Upgrade-Insecure-Requests: 1'
];

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

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
    
    echo "=== Headers Sent ===\n";
    foreach ($headers as $h) {
        echo "$h\n";
    }
    
    echo "\n=== Response Headers ===\n";
    echo $responseHeaders . "\n";
    
    echo "\n=== Body (first 500 chars) ===\n";
    echo substr($responseBody, 0, 500) . "\n";
} else {
    echo "No response received\n";
}
?>
