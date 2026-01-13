<?php
session_start();

// إعدادات افتراضية
$default_config = [
    'base_url' => 'http://37.34.237.190:9292/TheOneAPIPOS/api/',
    'username' => 'c18e4f8f33a47884',
    'password' => 'WdGDr6c8cPdc17O6YLns/R+rpRagngiPOEu7FhsmgAs=',
    'encryption_key' => '1f08c364c4cccf6bdd273f8e3be277f8',
    'iv' => 'c18e4f8f33a47884'
];

// تحميل الإعدادات من الجلسة أو استخدام الافتراضية
function getConfig() {
    global $default_config;
    if (isset($_SESSION['api_config'])) {
        return $_SESSION['api_config'];
    }
    return $default_config;
}

// حفظ الإعدادات في الجلسة
function saveConfig($config) {
    $_SESSION['api_config'] = $config;
}

// دالة لاستدعاء API
function callAPI($endpoint, $params = []) {
    $config = getConfig();
    
    $url = $config['base_url'] . $endpoint;
    if (!empty($params)) {
        $url .= '?' . http_build_query($params);
    }
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Basic " . base64_encode($config['username'] . ":" . $config['password']),
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'response' => $response,
        'http_code' => $http_code,
        'error' => $error,
        'url' => $url
    ];
}

// دالة لفك التشفير
function decryptResponse($encrypted_data) {
    $config = getConfig();
    
    $decrypted = openssl_decrypt(
        base64_decode($encrypted_data),
        "AES-256-CBC",
        $config['encryption_key'],
        OPENSSL_RAW_DATA,
        $config['iv']
    );
    
    return $decrypted;
}
?>
