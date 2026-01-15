<?php
// Simple test to verify PHP is working
header('Content-Type: text/plain');
echo "PHP is working!\n";
echo "PHP Version: " . phpversion() . "\n";
echo "cURL available: " . (function_exists('curl_init') ? 'Yes' : 'No') . "\n";
echo "Current directory: " . __DIR__ . "\n";
?>
