<div class="card">
    <div class="card-header">
        <i class="fas fa-cog"></i> إعدادات التشفير والاتصال
    </div>
    <div class="card-body">
        <form method="POST">
            <div class="row">
                <div class="col-12 mb-4">
                    <h5 class="text-primary"><i class="fas fa-link"></i> إعدادات الاتصال</h5>
                    <hr>
                </div>
                <div class="col-12 mb-3">
                    <label class="form-label">Base URL</label>
                    <input type="text" name="base_url" class="form-control" dir="ltr" 
                           value="<?= htmlspecialchars($config['base_url']) ?>" 
                           placeholder="http://37.34.237.190:9292/TheOneAPIPOS/api/">
                    <small class="text-muted">الرابط الأساسي للـ API</small>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Username (اسم المستخدم)</label>
                    <input type="text" name="username" class="form-control" dir="ltr" 
                           value="<?= htmlspecialchars($config['username']) ?>">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Password (كلمة المرور)</label>
                    <input type="text" name="password" class="form-control" dir="ltr" 
                           value="<?= htmlspecialchars($config['password']) ?>">
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-12 mb-4">
                    <h5 class="text-success"><i class="fas fa-key"></i> إعدادات فك التشفير (AES-256-CBC)</h5>
                    <hr>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Encryption Key (مفتاح التشفير)</label>
                    <input type="text" name="encryption_key" class="form-control" dir="ltr" 
                           value="<?= htmlspecialchars($config['encryption_key']) ?>">
                    <small class="text-muted">يجب أن يكون 32 حرفًا</small>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">IV (المتجه الابتدائي)</label>
                    <input type="text" name="iv" class="form-control" dir="ltr" 
                           value="<?= htmlspecialchars($config['iv']) ?>">
                    <small class="text-muted">يجب أن يكون 16 حرفًا</small>
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-12">
                    <button type="submit" name="save_config" class="btn btn-primary">
                        <i class="fas fa-save"></i> حفظ الإعدادات
                    </button>
                    <button type="reset" class="btn btn-secondary">
                        <i class="fas fa-undo"></i> إعادة تعيين
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>

<div class="card mt-4">
    <div class="card-header bg-info text-white">
        <i class="fas fa-info-circle"></i> الإعدادات الحالية
    </div>
    <div class="card-body">
        <div class="response-box">
<?php
echo "=== Current Configuration ===\n\n";
echo "Base URL: " . $config['base_url'] . "\n";
echo "Username: " . $config['username'] . "\n";
echo "Password: " . substr($config['password'], 0, 20) . "...\n";
echo "Encryption Key: " . $config['encryption_key'] . "\n";
echo "IV: " . $config['iv'] . "\n";
echo "\nKey Length: " . strlen($config['encryption_key']) . " characters\n";
echo "IV Length: " . strlen($config['iv']) . " characters\n";
?>
        </div>
    </div>
</div>
