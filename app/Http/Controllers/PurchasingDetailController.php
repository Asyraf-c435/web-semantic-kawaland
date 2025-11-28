<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Request;
use App\Models\RequestItem;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\DB;

class PurchasingDetailController extends Controller
{
    public function show($departmentId)
    {
        // Convert department ID to proper name
        $departmentName = $this->getDepartmentName($departmentId);

        // PERBAIKAN: Ambil data dari request_items dengan relasi request
        $requestItems = RequestItem::where('departemen', $departmentName)
            ->with(['request']) // Load relasi request untuk mendapatkan request_number
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform data untuk frontend
        $orders = [];
        foreach ($requestItems as $item) {
            $orders[] = [
                'id' => $item->id,
                'request_id' => $item->request_id,
                'request_number' => $item->request->request_number,
                'namaBarang' => $item->nama_barang,
                'departemen' => $item->departemen,
                'jumlahBarang' => $item->jumlah_diajukan,
                'satuan' => $item->satuan,
                'catatan' => $item->catatan,
                'status' => $this->mapStatus($item->status),
                'created_at' => $item->created_at->format('Y-m-d H:i:s'),
            ];
        }

        // Hitung statistics berdasarkan request_items
        $totalItems = $requestItems->count();
        $pendingCount = $requestItems->where('status', 'Pending')->count();
        $approvedCount = $requestItems->where('status', 'Approved')->count();
        $completedCount = $requestItems->where('status', 'Completed')->count();
        $rejectedCount = $requestItems->where('status', 'Rejected')->count();

        // Hitung total requests (unik) untuk department ini
        $totalRequests = Request::where('department', $departmentName)->count();

        return Inertia::render('table/purchasing', [
            'department' => $departmentName,
            'departmentId' => $departmentId,
            'orders' => $orders,
            'stats' => [
                'total_requests' => $totalRequests,
                'total_items' => $totalItems,
                'pending_count' => $pendingCount,
                'approved_count' => $approvedCount,
                'completed_count' => $completedCount,
                'rejected_count' => $rejectedCount,
            ]
        ]);
    }

    /**
     * Approve semua items untuk department tertentu
     */
    public function approveAll($departmentId)
    {
        try {
            $departmentName = $this->getDepartmentName($departmentId);
            
            // Update semua request items yang Pending menjadi Approved
            $updated = RequestItem::where('departemen', $departmentName)
                ->where('status', 'Pending')
                ->update([
                    'status' => 'Approved',
                    'jumlah_disetujui' => DB::raw('jumlah_diajukan') // Set jumlah disetujui = jumlah diajukan
                ]);

            return redirect()->back()->with('success', "Berhasil menyetujui {$updated} item untuk departemen {$departmentName}");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menyetujui item: ' . $e->getMessage());
        }
    }

    /**
     * Update status item individual
     */
    public function updateStatus(HttpRequest $request, $itemId)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:Pending,Approved,Rejected,Completed'
            ]);

            $item = RequestItem::findOrFail($itemId);
            $item->status = $validated['status'];
            
            // Jika disetujui, set jumlah_disetujui = jumlah_diajukan
            if ($validated['status'] === 'Approved') {
                $item->jumlah_disetujui = $item->jumlah_diajukan;
            }
            
            $item->save();

            return redirect()->back()->with('success', 'Status berhasil diupdate');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mengupdate status: ' . $e->getMessage());
        }
    }

    public function departmentOverview()
    {
        // Dapatkan semua department yang ada dari request_items
        $departmentsFromItems = RequestItem::distinct()
            ->whereNotNull('departemen')
            ->pluck('departemen')
            ->toArray();

        $departments = [];

        foreach ($departmentsFromItems as $deptName) {
            $deptId = $this->getDepartmentId($deptName);
            
            // Hitung berdasarkan request_items
            $totalItems = RequestItem::where('departemen', $deptName)->count();
            $pendingCount = RequestItem::where('departemen', $deptName)->where('status', 'Pending')->count();
            $approvedCount = RequestItem::where('departemen', $deptName)->where('status', 'Approved')->count();
            $completedCount = RequestItem::where('departemen', $deptName)->where('status', 'Completed')->count();
            
            // Hitung total requests untuk department ini
            $totalRequests = Request::where('department', $deptName)->count();

            $departments[] = [
                'id' => $deptId,
                'name' => $deptName,
                'total_requests' => $totalRequests,
                'total_items' => $totalItems,
                'pending_count' => $pendingCount,
                'approved_count' => $approvedCount,
                'completed_count' => $completedCount,
            ];
        }

        // Jika tidak ada data, gunakan sample data
        if (empty($departments)) {
            $departments = [
                [
                    'id' => 'food-beverage',
                    'name' => 'Food and Beverage',
                    'total_requests' => 15,
                    'total_items' => 23,
                    'pending_count' => 0,
                    'approved_count' => 0,
                    'completed_count' => 0,
                ],
                [
                    'id' => 'housekeeping',
                    'name' => 'House keeping',
                    'total_requests' => 8,
                    'total_items' => 23,
                    'pending_count' => 0,
                    'approved_count' => 0,
                    'completed_count' => 23,
                ],
                [
                    'id' => 'security',
                    'name' => 'Security',
                    'total_requests' => 12,
                    'total_items' => 23,
                    'pending_count' => 10,
                    'approved_count' => 13,
                    'completed_count' => 0,
                ],
                [
                    'id' => 'finance',
                    'name' => 'Finance',
                    'total_requests' => 7,
                    'total_items' => 23,
                    'pending_count' => 0,
                    'approved_count' => 0,
                    'completed_count' => 0,
                ],
            ];
        }

        // Hitung total stats untuk StatsCards
        $totalStats = [
            'total_requests' => collect($departments)->sum('total_requests'),
            'total_items' => collect($departments)->sum('total_items'),
            'pending_requests' => collect($departments)->sum('pending_count'),
            'approved_requests' => collect($departments)->sum('approved_count'),
            'completed_requests' => collect($departments)->sum('completed_count'),
            'rejected_requests' => 0,
        ];

        return Inertia::render('departments/overview', [
            'departments' => $departments,
            'stats' => $totalStats
        ]);
    }

    private function getDepartmentName($departmentId)
    {
        $departmentMap = [
            'food-beverage' => 'Food and Beverage',
            'housekeeping' => 'House keeping',
            'security' => 'Security',
            'finance' => 'Finance',
        ];

        return $departmentMap[$departmentId] ?? ucwords(str_replace('-', ' ', $departmentId));
    }

    private function getDepartmentId($departmentName)
    {
        $departmentMap = [
            'Food and Beverage' => 'food-beverage',
            'House keeping' => 'housekeeping',
            'Security' => 'security',
            'Finance' => 'finance',
        ];

        return $departmentMap[$departmentName] ?? strtolower(str_replace(' ', '-', $departmentName));
    }

    private function mapStatus($status)
    {
        $statusMap = [
            'pending' => 'ditunda',
            'approved' => 'diterima',
            'rejected' => 'ditolak',
            'completed' => 'diterima',
            'Pending' => 'ditunda',
            'Approved' => 'diterima',
            'Rejected' => 'ditolak',
            'Completed' => 'diterima',
        ];

        return $statusMap[strtolower($status)] ?? 'ditunda';
    }
}