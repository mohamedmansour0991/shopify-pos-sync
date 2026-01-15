<?php
/**
 * Test if DirectoryIndex is working
 * This file should be accessible directly
 */
header('Content-Type: text/plain');
echo "=== DirectoryIndex Test ===\n\n";
echo "If you see this, DirectoryIndex is NOT working for index.php\n";
echo "DirectoryIndex should load index.php automatically for /\n\n";
echo "REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'N/A') . "\n";
echo "SCRIPT_NAME: " . ($_SERVER['SCRIPT_NAME'] ?? 'N/A') . "\n";
echo "PHP_SELF: " . ($_SERVER['PHP_SELF'] ?? 'N/A') . "\n";
?>
