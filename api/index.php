<?php
require_once 'config.php';

// معالجة حفظ الإعدادات
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_config'])) {
    saveConfig([
        'base_url' => $_POST['base_url'],
        'username' => $_POST['username'],
        'password' => $_POST['password'],
        'encryption_key' => $_POST['encryption_key'],
        'iv' => $_POST['iv']
    ]);
    $message = "✅ تم حفظ الإعدادات بنجاح!";
}

$config = getConfig();
$current_page = $_GET['page'] ?? 'home';
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Tester - اختبار الـ API</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --sidebar-width: 280px;
            --primary-color: #4f46e5;
            --secondary-color: #7c3aed;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f8fafc;
            min-height: 100vh;
        }
        
        .sidebar {
            position: fixed;
            right: 0;
            top: 0;
            width: var(--sidebar-width);
            height: 100vh;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            padding: 20px;
            overflow-y: auto;
            z-index: 1000;
        }
        
        .sidebar .logo {
            color: white;
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 30px;
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        
        .sidebar .nav-link {
            color: rgba(255,255,255,0.8);
            padding: 12px 15px;
            border-radius: 10px;
            margin-bottom: 5px;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .sidebar .nav-link:hover, .sidebar .nav-link.active {
            background: rgba(255,255,255,0.2);
            color: white;
        }
        
        .sidebar .nav-link i {
            width: 20px;
            text-align: center;
        }
        
        .main-content {
            margin-right: var(--sidebar-width);
            padding: 30px;
            min-height: 100vh;
        }
        
        .card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            margin-bottom: 20px;
        }
        
        .card-header {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            color: white;
            border-radius: 15px 15px 0 0 !important;
            padding: 15px 20px;
            font-weight: bold;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            border: none;
            padding: 10px 25px;
            border-radius: 10px;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(79, 70, 229, 0.4);
        }
        
        .response-box {
            background: #1e293b;
            color: #22d3ee;
            border-radius: 10px;
            padding: 20px;
            max-height: 500px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            direction: ltr;
            text-align: left;
        }
        
        .form-control, .form-select {
            border-radius: 10px;
            border: 2px solid #e2e8f0;
            padding: 10px 15px;
        }
        
        .form-control:focus, .form-select:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .alert {
            border-radius: 10px;
        }
        
        .api-badge {
            background: #10b981;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            margin-left: 10px;
        }
        
        .loading {
            display: none;
            text-align: center;
            padding: 20px;
        }
        
        .loading.show {
            display: block;
        }
        
        @media (max-width: 768px) {
            .sidebar {
                width: 100%;
                height: auto;
                position: relative;
            }
            .main-content {
                margin-right: 0;
            }
        }
    </style>
</head>
<body>
    <!-- الشريط الجانبي -->
    <div class="sidebar">
        <div class="logo">
            <i class="fas fa-code"></i> API Tester
        </div>
        <nav class="nav flex-column">
            <a class="nav-link <?= $current_page == 'home' ? 'active' : '' ?>" href="?page=home">
                <i class="fas fa-home"></i> الرئيسية
            </a>
            <a class="nav-link <?= $current_page == 'settings' ? 'active' : '' ?>" href="?page=settings">
                <i class="fas fa-cog"></i> إعدادات التشفير
            </a>
            <hr style="border-color: rgba(255,255,255,0.2)">
            <small class="text-white-50 px-3 mb-2">اختبار الـ APIs</small>
            <a class="nav-link <?= $current_page == 'products' ? 'active' : '' ?>" href="?page=products">
                <i class="fas fa-boxes"></i> جميع المنتجات
            </a>
            <a class="nav-link <?= $current_page == 'categories' ? 'active' : '' ?>" href="?page=categories">
                <i class="fas fa-folder"></i> الفئات الرئيسية
            </a>
            <a class="nav-link <?= $current_page == 'subcategories' ? 'active' : '' ?>" href="?page=subcategories">
                <i class="fas fa-folder-tree"></i> الفئات الفرعية
            </a>
            <a class="nav-link <?= $current_page == 'category_products' ? 'active' : '' ?>" href="?page=category_products">
                <i class="fas fa-box"></i> منتجات فئة معينة
            </a>
            <hr style="border-color: rgba(255,255,255,0.2)">
            <a class="nav-link <?= $current_page == 'custom' ? 'active' : '' ?>" href="?page=custom">
                <i class="fas fa-terminal"></i> استعلام مخصص
            </a>
        </nav>
    </div>

    <!-- المحتوى الرئيسي -->
    <div class="main-content">
        <?php if (isset($message)): ?>
            <div class="alert alert-success alert-dismissible fade show">
                <?= $message ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <?php
        switch ($current_page) {
            case 'settings':
                include 'pages/settings.php';
                break;
            case 'products':
                include 'pages/products.php';
                break;
            case 'categories':
                include 'pages/categories.php';
                break;
            case 'subcategories':
                include 'pages/subcategories.php';
                break;
            case 'category_products':
                include 'pages/category_products.php';
                break;
            case 'custom':
                include 'pages/custom.php';
                break;
            default:
                include 'pages/home.php';
        }
        ?>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
