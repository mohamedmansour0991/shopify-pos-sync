<?php
$result = null;
$custom_endpoint = $_POST['endpoint'] ?? '';
$custom_params = $_POST['params'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['test'])) {
    $params = [];
    if (!empty($custom_params)) {
        parse_str($custom_params, $params);
    }
    $result = callAPI($custom_endpoint, $params);
}
?>

<div class="card">
    <div class="card-header">
        <i class="fas fa-terminal"></i> استعلام مخصص
        <span class="api-badge">Custom</span>
    </div>
    <div class="card-body">
        <form method="POST">
            <div class="row">
                <div class="col-12 mb-3">
                    <label class="form-label">Endpoint</label>
                    <input type="text" name="endpoint" class="form-control" dir="ltr" 
                           value="<?= htmlspecialchars($custom_endpoint) ?>"
                           placeholder="مثال: Product/Get أو Category/GetMainCategory">
                    <small class="text-muted">أدخل المسار بدون Base URL</small>
                </div>
                <div class="col-12 mb-3">
                    <label class="form-label">المعاملات (Parameters)</label>
                    <textarea name="params" class="form-control" dir="ltr" rows="3" 
                              placeholder="مثال: pageNumber=1&pageSize=20&sortCol=ProductCode"><?= htmlspecialchars($custom_params) ?></textarea>
                    <small class="text-muted">أدخل المعاملات بصيغة Query String</small>
                </div>
            </div>
            <button type="submit" name="test" value="1" class="btn btn-primary">
                <i class="fas fa-play"></i> تنفيذ الاستعلام
            </button>
        </form>
    </div>
</div>

<div class="card mt-4">
    <div class="card-header bg-secondary text-white">
        <i class="fas fa-list"></i> أمثلة سريعة
    </div>
    <div class="card-body">
        <div class="row">
            <div class="col-md-6 mb-3">
                <div class="border rounded p-3">
                    <h6>جميع المنتجات</h6>
                    <code class="d-block mb-2">Endpoint: Product/Get</code>
                    <code class="d-block">Params: pageNumber=1&pageSize=20&sortCol=ProductCode&sortType=Ascending</code>
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="border rounded p-3">
                    <h6>الفئات الرئيسية</h6>
                    <code class="d-block mb-2">Endpoint: Category/GetMainCategory</code>
                    <code class="d-block">Params: (لا يوجد)</code>
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="border rounded p-3">
                    <h6>الفئات الفرعية</h6>
                    <code class="d-block mb-2">Endpoint: Category/GetCategoryByParentId</code>
                    <code class="d-block">Params: Parent=2135</code>
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="border rounded p-3">
                    <h6>منتجات فئة معينة</h6>
                    <code class="d-block mb-2">Endpoint: Product/GetProductsByCategory</code>
                    <code class="d-block">Params: categoryId=7&pageNumber=1&pageSize=100&ACID=-1&GBranchID=3</code>
                </div>
            </div>
        </div>
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
        <?php elseif ($result['http_code'] == 0): ?>
            <div class="alert alert-danger">⚠️ فشل الاتصال بالخادم</div>
        <?php else: ?>
            <?php 
            $decrypted = decryptResponse($result['response']);
            $data = json_decode($decrypted, true);
            ?>
            
            <?php if ($decrypted === false): ?>
                <div class="alert alert-danger">⚠️ فشل فك التشفير!</div>
                <h6>البيانات المشفرة (Raw):</h6>
                <div class="response-box"><?= htmlspecialchars($result['response']) ?></div>
            <?php else: ?>
                <div class="alert alert-success">✅ تم فك التشفير بنجاح!</div>
                <h6>البيانات (JSON):</h6>
                <div class="response-box"><pre><?= htmlspecialchars(json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) ?></pre></div>
            <?php endif; ?>
        <?php endif; ?>
    </div>
</div>
<?php endif; ?>
