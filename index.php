<?php
/**
 * PHP Proxy to Node.js Application
 * This file proxies all requests to the Node.js server running on port 3000
 */

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Disable output buffering
while (ob_get_level()) {
    ob_end_clean();
}

// Get the request URI and method
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Remove query string from URI for building target URL
$uriWithoutQuery = parse_url($requestUri, PHP_URL_PATH) ?: '/';

// Build the target URL
$targetUrl = 'http://127.0.0.1:3000' . $uriWithoutQuery;

// If there's a query string, append it
if (!empty($_SERVER['QUERY_STRING'])) {
    $targetUrl .= '?' . $_SERVER['QUERY_STRING'];
}

// Initialize cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);

// Set request method
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $requestMethod);

// Forward headers
$headers = [];
foreach (getallheaders() as $name => $value) {
    // Skip some headers that shouldn't be forwarded
    $lowerName = strtolower($name);
    if (!in_array($lowerName, ['host', 'connection', 'content-length'])) {
        $headers[] = "$name: $value";
    }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Forward request body for POST/PUT/PATCH
if (in_array($requestMethod, ['POST', 'PUT', 'PATCH'])) {
    $body = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Execute request
$response = curl_exec($ch);

// Get HTTP status code and errors
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

// If there was an error, show it
if ($error || $response === false) {
    http_response_code(502);
    header('Content-Type: text/plain');
    echo "Bad Gateway: Could not connect to Node.js server.\n";
    if ($error) {
        echo "Error: $error\n";
    } else {
        echo "Error: cURL request failed\n";
    }
    echo "Target URL: $targetUrl\n";
    exit;
}

// Check if response is empty
if (empty($response)) {
    http_response_code(502);
    header('Content-Type: text/plain');
    echo "Bad Gateway: Empty response from Node.js server.\n";
    exit;
}

// Split headers and body
$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);

// Parse and forward response headers
$headerLines = explode("\r\n", $responseHeaders);
foreach ($headerLines as $headerLine) {
    if (empty($headerLine) || strpos($headerLine, 'HTTP/') === 0) {
        continue;
    }
    $headerParts = explode(':', $headerLine, 2);
    if (count($headerParts) === 2) {
        $name = trim($headerParts[0]);
        $value = trim($headerParts[1]);
        $lowerName = strtolower($name);
        
        // Skip some headers
        if (!in_array($lowerName, ['transfer-encoding', 'connection', 'content-encoding', 'content-length'])) {
            header("$name: $value", false);
        }
    }
}

// Set response status
http_response_code($httpCode);

// Output response body
echo $responseBody;
?>
