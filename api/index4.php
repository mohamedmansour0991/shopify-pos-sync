<?php

/*********************************اختبار التشفير و get */

$api_url = "http://37.34.237.190:9292/TheOneAPIPOS/api/Product/Get?&pageNumber=1&pageSize=20&sortCol=ProductCode&sortType=Ascending";
//$api_url = "http://62.150.232.56/TheOneAPIPlan/api/Product/Get?&pageNumber=1&pageSize=1000&sortCol=ProductCode&sortType=Ascending";
//$api_url = "http://62.150.232.56/TheOneAPIPlan/api/Product/GetProductsByCategory?categoryId=79&pageNumber=1&pageSize=100";
$username = "c18e4f8f33a47884";
$password = "WdGDr6c8cPdc17O6YLns/R+rpRagngiPOEu7FhsmgAs=";

// 🔹 إعداد الطلب باستخدام cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Basic " . base64_encode("$username:$password"),
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// ✅ التحقق من استجابة API
if ($http_code == 401) {
    die("⚠️ خطأ: غير مصرح لك بالوصول إلى الـ API. تحقق من اسم المستخدم وكلمة المرور.");
} elseif (!$response) {
    die("⚠️ خطأ: فشل الاتصال بـ API.");
}


// 🔹 بيانات التشفير (المفتاح والمفتاح الابتدائي IV)
$encryption_key = "1f08c364c4cccf6bdd273f8e3be277f8"; // مفتاح AES-256-CBC (يجب أن يكون 32 حرفًا)
$iv = "c18e4f8f33a47884"; // يجب أن يكون 16 حرفًا (128-bit)

// ✅ فك تشفير البيانات باستخدام AES-256-CBC
$decrypted_data = openssl_decrypt(
    base64_decode($response), // تحويل البيانات من Base64 قبل فك التشفير
    "AES-256-CBC",
    $encryption_key,
    OPENSSL_RAW_DATA,
    $iv
);

// ✅ طباعة البيانات المفككة
if ($decrypted_data === false) {
    die("⚠️ خطأ: فشل فك التشفير. تأكد من المفتاح و IV.");
}

$data = json_decode($decrypted_data, true);
echo "<pre>🔹 البيانات المفككة: ";
print_r($data); // تحويل JSON إلى مصفوفة PHP
echo "</pre>";

//$first_product = $data[0];

//echo "أول فئة في أول منتج: " . $first_product['CategoryArName'];

?>
<a href="index5.php"> اصناف</a>