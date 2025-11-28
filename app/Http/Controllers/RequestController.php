<?php

namespace App\Http\Controllers;

use App\Models\Request as RequestModel;
use App\Models\RequestItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class RequestController extends Controller
{
    public function index()
    {
        // Kirim data user yang sedang login ke komponen Inertia
        return Inertia::render('OrdersPage', [
            'user' => [
                'id' => Auth::id(),
                'name' => Auth::user()->name,
                'departemen' => Auth::user()->departemen, // Pastikan kolom ini ada di tabel users
                'email' => Auth::user()->email,
            ],
        ]);
    }

    public function store(Request $request)
    {
        // Debug: Lihat data yang diterima
        Log::info('Data received:', $request->all());

        // Validasi tanpa department karena akan diambil dari Auth::user()
        $validated = $request->validate([
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.kode_barang' => 'nullable|string|max:50',
            'items.*.nama_barang' => 'required|string|max:100',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.satuan' => 'required|string|max:20',
            'items.*.catatan' => 'nullable|string',
        ]);
        
        // Ambil Departemen dari User yang sedang login
        $userDepartment = Auth::user()->departemen;

        if (!$userDepartment) {
            return redirect()->back()->withErrors([
                'department' => 'Gagal mengirim request: Data departemen pengguna tidak ditemukan.',
            ]);
        }

        DB::beginTransaction();
        try {
            // Generate nomor request otomatis
            $requestNumber = $this->generateRequestNumber();

            // Simpan data ke tabel requests
            $requestModel = RequestModel::create([
                'request_number' => $requestNumber,
                'user_id' => Auth::id(),
                'department' => $userDepartment, // Menggunakan departemen dari user
                'request_date' => now()->toDateString(),
                'status' => 'Pending',
                'notes' => $validated['notes'] ?? null,
            ]);

            // Simpan items ke tabel request_items
        foreach ($validated['items'] as $item) {
    RequestItem::create([
        'request_id' => $requestModel->id,
        'kode_barang' => $item['kode_barang'] ?? null,
        'nama_barang' => $item['nama_barang'],
        'jumlah_diajukan' => $item['jumlah'],
        'satuan' => $item['satuan'],
        'catatan' => $item['catatan'] ?? null,
        'status' => 'Pending',
        'departemen' => $userDepartment,
        'jumlah_disetujui' => 0,
    ]);
}


            DB::commit();

            return redirect()->back()->with([
                'success' => true,
                'message' => 'Request berhasil dikirim!',
                'request_number' => $requestNumber
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating request: ' . $e->getMessage());
            
            return redirect()->back()->withErrors([
                'message' => 'Gagal mengirim request: ' . $e->getMessage()
            ]);
        }
    }

    private function generateRequestNumber()
    {
        $date = now()->format('Ymd');
        $prefix = "REQ-{$date}-";
        
        $lastRequest = RequestModel::where('request_number', 'like', $prefix . '%')
            ->orderBy('request_number', 'desc')
            ->first();

        if ($lastRequest) {
            $lastNumber = (int) substr($lastRequest->request_number, -3);
            $newNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '001';
        }

        return $prefix . $newNumber;
    }
}