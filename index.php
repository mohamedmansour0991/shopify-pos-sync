<?php
/**
 * PHP Proxy to Node.js Application
 * This file proxies all requests to the Node.js server running on port 3000
 */

// Disable all output buffering
while (ob_get_level()) {
    ob_end_clean();
}
// Enable error reporting for debugging (disable in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);
ini_set('log_errors', 1);

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
if ($ch === false) {
    http_response_code(500);
    header('Content-Type: text/plain');
    echo "Internal Server Error: Failed to initialize cURL";
    exit;
}

curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
// Handle chunked encoding properly
curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);

// Set request method
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $requestMethod);

// Forward headers
// getallheaders() may not be available in CGI mode, so use $_SERVER
$headers = [];
foreach ($_SERVER as $key => $value) {
    // Convert SERVER keys to HTTP headers (e.g., HTTP_ACCEPT -> Accept)
    if (strpos($key, 'HTTP_') === 0) {
        $headerName = str_replace('_', '-', substr($key, 5));
        $lowerName = strtolower($headerName);
        // Skip some headers that shouldn't be forwarded
        if (!in_array($lowerName, ['host', 'connection', 'content-length', 'transfer-encoding', 'content-type'])) {
            $headers[] = "$headerName: $value";
        }
    }
}

// Add X-Forwarded-Proto for HTTPS
if ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') || 
    (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')) {
    $headers[] = "X-Forwarded-Proto: https";
}
// Add X-Forwarded-Host
if (isset($_SERVER['HTTP_HOST'])) {
    $headers[] = "X-Forwarded-Host: " . $_SERVER['HTTP_HOST'];
}

// Forward request body ONLY for POST/PUT/PATCH/DELETE
if (in_array($requestMethod, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    // Read raw body
    $body = file_get_contents('php://input');
    
    if (!empty($body)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        // Add Content-Type and Content-Length only if body exists
        if (isset($_SERVER['CONTENT_TYPE']) && !empty($_SERVER['CONTENT_TYPE'])) {
            $headers[] = "Content-Type: " . $_SERVER['CONTENT_TYPE'];
        }
        // Ensure Content-Length is set
        $hasContentLength = false;
        foreach ($headers as $header) {
            if (stripos($header, 'Content-Length:') === 0) {
                $hasContentLength = true;
                break;
            }
        }
        if (!$hasContentLength) {
            $headers[] = "Content-Length: " . strlen($body);
        }
    }
}
// For GET/HEAD requests, explicitly ensure no Content-Type or Content-Length
// This is critical to prevent FormData parsing errors

if (!empty($headers)) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
}

// Execute request
$response = curl_exec($ch);

// Get HTTP status code and errors
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
$errno = curl_errno($ch);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

// If there was an error, show it
if ($error || $response === false) {
    http_response_code(502);
    header('Content-Type: text/plain');
    echo "Bad Gateway: Could not connect to Node.js server.\n";
    if ($error) {
        echo "Error: $error (Code: $errno)\n";
    } else {
        echo "Error: cURL request failed\n";
    }
    echo "Target URL: $targetUrl\n";
    echo "Request Method: $requestMethod\n";
    error_log("PHP Proxy Error: $error (Code: $errno) - URL: $targetUrl");
    exit;
}

// Check if response is empty
if (empty($response)) {
    http_response_code(502);
    header('Content-Type: text/plain');
    echo "Bad Gateway: Empty response from Node.js server.\n";
    echo "Target URL: $targetUrl\n";
    echo "HTTP Code: $httpCode\n";
    error_log("PHP Proxy Error: Empty response from Node.js - URL: $targetUrl, HTTP Code: $httpCode");
    exit;
}

// Split headers and body
$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);

// Parse and forward response headers
$headerLines = explode("\r\n", $responseHeaders);
$isChunked = false;
foreach ($headerLines as $headerLine) {
    $headerLine = trim($headerLine);
    if (empty($headerLine) || strpos($headerLine, 'HTTP/') === 0) {
        continue;
    }
    $headerParts = explode(':', $headerLine, 2);
    if (count($headerParts) === 2) {
        $name = trim($headerParts[0]);
        $value = trim($headerParts[1]);
        $lowerName = strtolower($name);
        
        // Check for chunked encoding
        if ($lowerName === 'transfer-encoding' && strtolower($value) === 'chunked') {
            $isChunked = true;
            continue; // Skip this header, PHP will handle it
        }
        
        // Skip some headers that PHP handles automatically
        if (!in_array($lowerName, ['transfer-encoding', 'connection', 'content-encoding', 'content-length', 'server'])) {
            header("$name: $value", false);
        }
    }
}

// Set response status BEFORE outputting body
http_response_code($httpCode);

// Output response body
// If chunked, the body should already be decoded by curl
echo $responseBody;
exit;
?>
