<?php
$result = null;
$params = [
    'categoryId' => $_GET['categoryId'] ?? 7,
    'pageNumber' => $_GET['pageNumber'] ?? 1,
    'pageSize' => $_GET['pageSize'] ?? 100,
    'ACID' => $_GET['ACID'] ?? -1,
    'GBranchID' => $_GET['GBranchID'] ?? 3
];

if (isset($_GET['test'])) {
    $result = callAPI('Product/GetProductsByCategory', $params);
}
?>

<div class="card">
    <div class="card-header">
        <i class="fas fa-box"></i> منتجات فئة معينة
        <span class="api-badge">GET</span>
    </div>
    <div class="card-body">
        <form method="GET">
            <input type="hidden" name="page" value="category_products">
            <div class="row">
                <div class="col-md-4 mb-3">
                    <label class="form-label">معرف الفئة (Category ID)</label>
                    <input type="number" name="categoryId" class="form-control" value="<?= $params['categoryId'] ?>" min="1">
                </div>
                <div class="col-md-4 mb-3">
                    <label class="form-label">رقم الصفحة</label>
                    <input type="number" name="pageNumber" class="form-control" value="<?= $params['pageNumber'] ?>" min="1">
                </div>
                <div class="col-md-4 mb-3">
                    <label class="form-label">عدد العناصر</label>
                    <input type="number" name="pageSize" class="form-control" value="<?= $params['pageSize'] ?>" min="1" max="500">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">ACID</label>
                    <input type="number" name="ACID" class="form-control" value="<?= $params['ACID'] ?>">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">GBranchID</label>
                    <input type="number" name="GBranchID" class="form-control" value="<?= $params['GBranchID'] ?>">
                </div>
            </div>
            <p><strong>Endpoint:</strong> <code>Product/GetProductsByCategory</code></p>
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
                <div class="alert alert-success">✅ تم فك التشفير بنجاح! (<?= is_array($data) ? count($data) : 0 ?> منتج)</div>
                
                <?php if (is_array($data) && count($data) > 0): ?>
                <h6>المنتجات:</h6>
                <div class="table-responsive mb-4">
                    <table class="table table-striped table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th>الكود</th>
                                <th>الاسم بالعربي</th>
                                <th>الاسم بالإنجليزي</th>
                                <th>السعر</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach (array_slice($data, 0, 20) as $product): ?>
                            <tr>
                                <td><?= $product['ProductCode'] ?? 'N/A' ?></td>
                                <td><?= $product['ProductArName'] ?? 'N/A' ?></td>
                                <td><?= $product['ProductEnName'] ?? 'N/A' ?></td>
                                <td><?= $product['Price'] ?? $product['SalePrice'] ?? 'N/A' ?></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <?php if (count($data) > 20): ?>
                    <p class="text-muted">عرض أول 20 منتج من أصل <?= count($data) ?></p>
                <?php endif; ?>
                <?php endif; ?>
                
                <h6>البيانات الكاملة (JSON):</h6>
                <div class="response-box"><pre><?= htmlspecialchars(json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) ?></pre></div>
            <?php endif; ?>
        <?php endif; ?>
    </div>
</div>
<?php endif; ?>
