<?php
/**
 * Test if .htaccess is working and routing to index.php
 */
header('Content-Type: text/plain');
echo "=== .htaccess Test ===\n\n";
echo "This file should NOT be accessible if .htaccess is working correctly.\n";
echo "If you see this, .htaccess is NOT routing requests to index.php.\n";
echo "\n";
echo "REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'N/A') . "\n";
echo "SCRIPT_NAME: " . ($_SERVER['SCRIPT_NAME'] ?? 'N/A') . "\n";
echo "PHP_SELF: " . ($_SERVER['PHP_SELF'] ?? 'N/A') . "\n";
?>
