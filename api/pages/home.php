<div class="row">
    <div class="col-12">
        <h2 class="mb-4"><i class="fas fa-home text-primary"></i> مرحباً بك في أداة اختبار API</h2>
    </div>
</div>

<div class="row">
    <div class="col-md-6 col-lg-3 mb-4">
        <div class="card h-100">
            <div class="card-body text-center">
                <i class="fas fa-boxes fa-3x text-primary mb-3"></i>
                <h5>المنتجات</h5>
                <p class="text-muted">عرض جميع المنتجات</p>
                <a href="?page=products" class="btn btn-primary btn-sm">استعراض</a>
            </div>
        </div>
    </div>
    <div class="col-md-6 col-lg-3 mb-4">
        <div class="card h-100">
            <div class="card-body text-center">
                <i class="fas fa-folder fa-3x text-success mb-3"></i>
                <h5>الفئات الرئيسية</h5>
                <p class="text-muted">عرض الفئات الرئيسية</p>
                <a href="?page=categories" class="btn btn-success btn-sm">استعراض</a>
            </div>
        </div>
    </div>
    <div class="col-md-6 col-lg-3 mb-4">
        <div class="card h-100">
            <div class="card-body text-center">
                <i class="fas fa-folder-tree fa-3x text-warning mb-3"></i>
                <h5>الفئات الفرعية</h5>
                <p class="text-muted">عرض الفئات الفرعية</p>
                <a href="?page=subcategories" class="btn btn-warning btn-sm">استعراض</a>
            </div>
        </div>
    </div>
    <div class="col-md-6 col-lg-3 mb-4">
        <div class="card h-100">
            <div class="card-body text-center">
                <i class="fas fa-cog fa-3x text-info mb-3"></i>
                <h5>الإعدادات</h5>
                <p class="text-muted">إعدادات التشفير</p>
                <a href="?page=settings" class="btn btn-info btn-sm">فتح</a>
            </div>
        </div>
    </div>
</div>

<div class="card mt-4">
    <div class="card-header">
        <i class="fas fa-info-circle"></i> نقاط الوصول المتاحة (API Endpoints)
    </div>
    <div class="card-body">
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>الوصف</th>
                    <th>Endpoint</th>
                    <th>الإجراء</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>جميع المنتجات</td>
                    <td><code>Product/Get</code></td>
                    <td><a href="?page=products" class="btn btn-sm btn-outline-primary">اختبار</a></td>
                </tr>
                <tr>
                    <td>الفئات الرئيسية</td>
                    <td><code>Category/GetMainCategory</code></td>
                    <td><a href="?page=categories" class="btn btn-sm btn-outline-primary">اختبار</a></td>
                </tr>
                <tr>
                    <td>الفئات الفرعية</td>
                    <td><code>Category/GetCategoryByParentId</code></td>
                    <td><a href="?page=subcategories" class="btn btn-sm btn-outline-primary">اختبار</a></td>
                </tr>
                <tr>
                    <td>منتجات فئة معينة</td>
                    <td><code>Product/GetProductsByCategory</code></td>
                    <td><a href="?page=category_products" class="btn btn-sm btn-outline-primary">اختبار</a></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
