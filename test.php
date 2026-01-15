<?php
// Simple test file
echo "PHP is working!\n";
echo "cURL available: " . (function_exists('curl_init') ? 'Yes' : 'No') . "\n";
echo "Current directory: " . __DIR__ . "\n";
echo "Node.js test: ";
$ch = curl_init('http://127.0.0.1:3000');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 2);
$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);
if ($error) {
    echo "Error: $error\n";
} else {
    echo "HTTP $httpCode - " . substr($result, 0, 100) . "\n";
}
?>
