<?php
$result = null;

if (isset($_GET['test'])) {
    $result = callAPI('Category/GetMainCategory');
}
?>

<div class="card">
    <div class="card-header">
        <i class="fas fa-folder"></i> الفئات الرئيسية
        <span class="api-badge">GET</span>
    </div>
    <div class="card-body">
        <form method="GET">
            <input type="hidden" name="page" value="categories">
            <p class="text-muted mb-3">
                <i class="fas fa-info-circle"></i> 
                هذا الـ API يُرجع جميع الفئات الرئيسية بدون معاملات إضافية
            </p>
            <p><strong>Endpoint:</strong> <code>Category/GetMainCategory</code></p>
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
                <div class="alert alert-success">✅ تم فك التشفير بنجاح! (<?= is_array($data) ? count($data) : 0 ?> فئة)</div>
                
                <?php if (is_array($data) && count($data) > 0): ?>
                <h6>الفئات:</h6>
                <div class="table-responsive mb-4">
                    <table class="table table-striped table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>الاسم بالعربي</th>
                                <th>الاسم بالإنجليزي</th>
                                <th>إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach (array_slice($data, 0, 20) as $cat): ?>
                            <tr>
                                <td><?= $cat['CategoryId'] ?? 'N/A' ?></td>
                                <td><?= $cat['CategoryArName'] ?? 'N/A' ?></td>
                                <td><?= $cat['CategoryEnName'] ?? 'N/A' ?></td>
                                <td>
                                    <a href="?page=subcategories&parent=<?= $cat['CategoryId'] ?? '' ?>&test=1" class="btn btn-sm btn-outline-primary">
                                        <i class="fas fa-folder-open"></i> الفرعية
                                    </a>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <?php endif; ?>
                
                <h6>البيانات الكاملة (JSON):</h6>
                <div class="response-box"><pre><?= htmlspecialchars(json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) ?></pre></div>
            <?php endif; ?>
        <?php endif; ?>
    </div>
</div>
<?php endif; ?>
