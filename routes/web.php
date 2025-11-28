<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\GudangController;
use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InputPriceController;
use App\Http\Controllers\MonitoringController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\DepartemenItemController;
use App\Http\Controllers\TransferBarangController;
use App\Http\Controllers\PurchasingDetailController;
use App\Http\Controllers\RequestManagementController;
use App\Http\Controllers\DashboardPurchasingController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ChatSemanticController;



// =======================
// AUTH | HOME
// =======================
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', fn() => Inertia::render('dashboard'))->name('home');
    Route::get('/dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');
});

// =======================
// AUTHENTICATED ROUTES
// =======================
Route::middleware(['auth'])->group(function () {

    // =======================
    // ABSENSI
    // =======================
    Route::get('/absensi', fn() => Inertia::render('CatatKehadiran'))->name('absensi');
    Route::get('/absensi/{id}', fn($id) => Inertia::render('user/absensi', ['id' => $id]))->name('user.absensi');
    Route::post('/absensi/store', [AbsensiController::class, 'store'])->name('absensi.store');
    Route::get('/absensi/riwayat', [AbsensiController::class, 'getRiwayat'])->name('absensi.riwayat');

    // =======================
    // PURCHASING & REQUEST
    // =======================
    Route::get('/dashboard-purchasing', [DashboardPurchasingController::class, 'index'])->name('dashboard-purchasing');
    Route::get('/dashboard-purchasing/department/{id}', [DashboardPurchasingController::class, 'getDepartmentDetails'])->name('dashboard-purchasing.department');
    Route::get('/purchasing/{departmentId}', [PurchasingDetailController::class, 'show'])->name('purchasing.detail');
    Route::post('/purchasing-detail/{departmentId}/approve-all', [PurchasingDetailController::class, 'approveAll'])->name('purchasing.approve-all');
    Route::post('/purchasing-detail/item/{itemId}/update-status', [PurchasingDetailController::class, 'updateStatus'])->name('purchasing.update-status');

    Route::get('/request', fn() => Inertia::render('table/request'))->name('request');
    Route::get('/request-item', [RequestController::class, 'index'])->name('request-item');
    Route::post('/requests', [RequestController::class, 'store'])->name('requests.store');
    Route::get('/requests/history', [RequestController::class, 'getRequestHistory'])->name('requests.history');

    // =======================
    // MONITORING
    // =======================
    Route::get('/monitoring-item', [MonitoringController::class, 'index'])->name('monitoring-item');
    Route::patch('/request-items/{id}', [MonitoringController::class, 'update'])->name('request-items.update');
    Route::delete('/request-items/{id}', [MonitoringController::class, 'destroy'])->name('request-items.destroy');

    // =======================
    // PERMISSION
    // =======================
    Route::get('/permission', fn() => Inertia::render('permission/page'))->name('permission');
    Route::get('/api/permissions', [PermissionController::class, 'index'])->name('permissions.index');
    Route::post('/api/permissions', [PermissionController::class, 'store'])->name('permissions.store');
    Route::delete('/api/permissions/{id}', [PermissionController::class, 'destroy'])->name('permissions.destroy');

    // =======================
    // INVENTORY
    // =======================
    Route::get('/inventory', fn() => Inertia::render('inventory/page'))->name('inventory');
    Route::get('/table-inventory', fn() => Inertia::render('inventory/table-inventory'))->name('table-inventory');

    // =======================
    // INPUT PRICE
    // =======================
    Route::get('/input-price', [InputPriceController::class, 'index'])->name('input-price');
    Route::post('/input-price/confirm-preorder', [InputPriceController::class, 'confirmPreorder'])->name('input-price.confirm');
    Route::post('/input-price/mark-arrived', [InputPriceController::class, 'markAsArrived'])->name('input-price.mark-arrived');
    Route::post('/input-price/mark-all-arrived', [InputPriceController::class, 'markAllArrived'])->name('input-price.mark-all-arrived');

    // =======================
    // TRANSFER
    // =======================
    Route::get('/transfer', [TransferBarangController::class, 'index'])->name('transfer.index');
    Route::post('/api/transfer/batch', [TransferBarangController::class, 'transferBatch'])->name('transfer.batch');
    Route::get('/api/department/items', [TransferBarangController::class, 'getDepartmentItems'])->name('department.items');
    Route::patch('/api/department/items/{id}/quantity', [TransferBarangController::class, 'updateDepartmentItemQuantity'])->name('department.items.update-quantity');
    Route::post('/api/inventory/transfer', [TransferBarangController::class, 'saveTransfer']);
    Route::get('/api/inventory/departemen', [TransferBarangController::class, 'getDepartemenItems']);

    // =======================
    // TOKO
    // =======================
    Route::get('/toko', fn() => Inertia::render('table/searchtoko'))->name('searchtoko');

    // =======================
    // ADMIN ROUTES
    // =======================
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/absensi', [AdminController::class, 'absensi'])->name('absensi');
        Route::get('/inventory', [AdminController::class, 'inventory'])->name('inventory');
        Route::get('/requestitem', fn() => Inertia::render('admin/RequestItem'))->name('requestitem');
        Route::get('/requestdetail/{kode_department}', fn($kode_department) => Inertia::render('admin/RequestDetailPage', ['kode_department' => $kode_department]))->name('requestdetail');
        Route::get('/dashboard/detail/{status}', fn($status) => Inertia::render('admin/StatusDetail', ['status' => $status]))->name('dashboard.detail');
        Route::get('/requests-management', [RequestManagementController::class, 'index'])->name('requests-management');
        Route::get('/requests-detail/{kodeDepartment}', [RequestManagementController::class, 'showDetail'])->name('requests-detail');
    });

    // =======================
    // REQUEST MANAGEMENT API
    // =======================
    Route::get('/api/requests-by-department/{kode_department}', [RequestManagementController::class, 'getRequestsByDepartment']);

});

// =======================
// PUBLIC API ROUTES
// =======================
Route::get('/api/inventory/gudang', [GudangController::class, 'index']);
Route::get('/api/inventory/gudang/{id}', [GudangController::class, 'show']);
Route::get('/api/departemen-items', [DepartemenItemController::class, 'index'])->name('departemen-items.index');
Route::get('/api/departemen-items/{departemen}', [DepartemenItemController::class, 'getByDepartemen'])->name('departemen-items.show');
Route::get('/api/departemen', [DepartemenItemController::class, 'getDepartemen'])->name('departemen.list');



// =======================
// SETTINGS
// =======================
require __DIR__ . '/settings.php';


// =======================
// SEMANTIC
// =======================


Route::get('/toko', function () {
    return Inertia::render('table/searchtoko'); // <-- nama folder & file Harus SESUAI
})->name('toko.index');

// Halaman UI (React)
Route::get('/products/{id}', function ($id) {
    return Inertia::render('table/productdetail', ['id' => $id]);
})->name('products.detail');

// Endpoint API Search
Route::prefix('semantic')->group(function () {
    Route::get('/search', [SearchController::class, 'index'])->name('semantic.search');

    // Endpoint API DETAIL PRODUK by ID
    Route::get('/products/{id}', [ProductController::class, 'show'])->name('semantic.product.show');
    Route::post('/semantic/chat', [ChatSemanticController::class, 'handle']);
});


// routes/web.php

