<?php
$result = null;
$params = [
    'pageNumber' => $_GET['pageNumber'] ?? 1,
    'pageSize' => $_GET['pageSize'] ?? 20,
    'sortCol' => $_GET['sortCol'] ?? 'ProductCode',
    'sortType' => $_GET['sortType'] ?? 'Ascending'
];

if (isset($_GET['test'])) {
    $result = callAPI('Product/Get', $params);
}
?>

<div class="card">
    <div class="card-header">
        <i class="fas fa-boxes"></i> جميع المنتجات
        <span class="api-badge">GET</span>
    </div>
    <div class="card-body">
        <form method="GET">
            <input type="hidden" name="page" value="products">
            <div class="row">
                <div class="col-md-3 mb-3">
                    <label class="form-label">رقم الصفحة</label>
                    <input type="number" name="pageNumber" class="form-control" value="<?= $params['pageNumber'] ?>" min="1">
                </div>
                <div class="col-md-3 mb-3">
                    <label class="form-label">عدد العناصر</label>
                    <input type="number" name="pageSize" class="form-control" value="<?= $params['pageSize'] ?>" min="1" max="100">
                </div>
                <div class="col-md-3 mb-3">
                    <label class="form-label">ترتيب حسب</label>
                    <select name="sortCol" class="form-select">
                        <option value="ProductCode" <?= $params['sortCol'] == 'ProductCode' ? 'selected' : '' ?>>كود المنتج</option>
                        <option value="ProductArName" <?= $params['sortCol'] == 'ProductArName' ? 'selected' : '' ?>>اسم المنتج</option>
                    </select>
                </div>
                <div class="col-md-3 mb-3">
                    <label class="form-label">نوع الترتيب</label>
                    <select name="sortType" class="form-select">
                        <option value="Ascending" <?= $params['sortType'] == 'Ascending' ? 'selected' : '' ?>>تصاعدي</option>
                        <option value="Descending" <?= $params['sortType'] == 'Descending' ? 'selected' : '' ?>>تنازلي</option>
                    </select>
                </div>
            </div>
            <button type="submit" name="test" value="1" class="btn btn-primary">
                <i class="fas fa-play"></i> اختبار API
            </button>
        </form>
    </div>
</div>

<?php if ($result): ?>
<div class="card mt-4">
    <div class="card-header">
        <i class="fas fa-server"></i> نتيجة الاستجابة
        <span class="badge bg-<?= $result['http_code'] == 200 ? 'success' : 'danger' ?> ms-2">
            HTTP <?= $result['http_code'] ?>
        </span>
    </div>
    <div class="card-body">
        <p><strong>URL:</strong> <code><?= htmlspecialchars($result['url']) ?></code></p>
        
        <?php if ($result['error']): ?>
            <div class="alert alert-danger">خطأ: <?= $result['error'] ?></div>
        <?php elseif ($result['http_code'] == 401): ?>
            <div class="alert alert-warning">⚠️ غير مصرح! تحقق من بيانات الاعتماد</div>
        <?php else: ?>
            <?php 
            $decrypted = decryptResponse($result['response']);
            $data = json_decode($decrypted, true);
            ?>
            
            <?php if ($decrypted === false): ?>
                <div class="alert alert-danger">⚠️ فشل فك التشفير!</div>
                <h6>البيانات المشفرة:</h6>
                <div class="response-box"><?= htmlspecialchars(substr($result['response'], 0, 500)) ?>...</div>
            <?php else: ?>
                <div class="alert alert-success">✅ تم فك التشفير بنجاح!</div>
                <h6>البيانات (JSON):</h6>
                <div class="response-box"><pre><?= htmlspecialchars(json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) ?></pre></div>
            <?php endif; ?>
        <?php endif; ?>
    </div>
</div>
<?php endif; ?>
