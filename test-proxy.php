<?php
// Test reverse proxy to Node.js
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:3000");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: " . $httpCode . "\n";
echo "Error: " . ($error ?: "None") . "\n";
echo "Response length: " . strlen($response) . " bytes\n";
if (strlen($response) > 0) {
    echo "First 500 chars:\n" . substr($response, 0, 500) . "\n";
}
?>
