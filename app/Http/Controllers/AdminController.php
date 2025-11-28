<?php

namespace App\Http\Controllers;

use App\Models\Absen;
use App\Models\Absensi;
use App\Models\AdminRequestItem;
use App\Models\Department;
use App\Models\Inventory;
use App\Models\Karyawan;
use App\Models\Permission;
use App\Models\RequestDetail;
use App\Models\RequestItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB as FacadesDB;


class AdminController extends Controller
{
    public function dashboard()
    {
        $today = now()->toDateString();

        // Hitung hadir berdasarkan tabel absen
        $hadir = Absen::whereDate('tanggal_absen', $today)
            ->whereIn('status_absen', ['HADIR', 'TERLAMBAT'])
            ->distinct('id_karyawan')
            ->count('id_karyawan');

        // Hitung sakit dari permissions
        $sakit = Permission::where('type', 'sick')
            ->where('status', 'approved')
            ->whereDate('created_at', $today)
            ->count();

        // Hitung izin dari permissions
        $izin = Permission::where('type', 'permission')
            ->where('status', 'approved')
            ->whereDate('created_at', $today)
            ->count();

        // Total karyawan aktif
        $totalKaryawan = Karyawan::where('status_aktif', 'AKTIF')->count();

        // Hitung belum absen
        $belum_absen = $totalKaryawan - $hadir;

        // Hitung tanpa keterangan (belum absen dan tidak ada permission)
        $karyawanSudahPermission = Permission::where('status', 'approved')
            ->whereDate('created_at', $today)
            ->distinct('user_id')
            ->count('user_id');

        $tanpa_keterangan = $belum_absen - $karyawanSudahPermission;

        // Data employees untuk tabel
        $employees = Karyawan::with(['department', 'detailKaryawan'])
            ->where('status_aktif', 'AKTIF')
            ->get()
            ->map(function ($karyawan) use ($today) {
                // Ambil data absen hari ini
                $absen = Absen::where('id_karyawan', $karyawan->id_karyawan)
                    ->whereDate('tanggal_absen', $today)
                    ->first();

                // Format waktu
                $time = $absen && $absen->jam_datang
                    ? Carbon::parse($absen->jam_datang)->format('H:i')
                    : '';

                // Tentukan status
                $status = $absen ? $absen->status_absen : 'Belum Absen';

                return [
                    'id' => $karyawan->id_karyawan,
                    'name' => $karyawan->detailKaryawan->nama ?? $karyawan->id_karyawan,
                    'department' => $karyawan->department->nama_department ?? '-',
                    'time' => $time,
                    'status' => $status,
                ];
            });

        return Inertia::render('admin/Dashboard', [
            'hadir' => $hadir,
            'sakit' => $sakit,
            'izin' => $izin,
            'belum_absen' => $belum_absen,
            'tanpa_keterangan' => $tanpa_keterangan,
            'employees' => $employees
        ]);
    }

    public function absensi()
    {
        $today = now()->toDateString();

        // === DETAIL HARIAN ===
        $employees = Karyawan::with(['department', 'detailKaryawan'])
            ->where('status_aktif', 'AKTIF')
            ->get()
            ->map(function ($karyawan) use ($today) {
                
                // Ambil nama dari detail_karyawan
                $nama = $karyawan->detailKaryawan->nama ?? $karyawan->id_karyawan;

                // Ambil data absen dari tabel absen
                $absenHariIni = Absen::where('id_karyawan', $karyawan->id_karyawan)
                    ->whereDate('tanggal_absen', $today)
                    ->first();

                // Format waktu absen
                $masuk = $absenHariIni && $absenHariIni->jam_datang
                    ? Carbon::parse($absenHariIni->jam_datang)->format('H:i')
                    : '-';

                $keluar = $absenHariIni && $absenHariIni->jam_balik
                    ? Carbon::parse($absenHariIni->jam_balik)->format('H:i')
                    : '-';

                // Cek Permission (Izin/Sakit) untuk hari ini
                $permission = DB::table('permissions')
                    ->where('user_id', $karyawan->id_karyawan)
                    ->whereDate('created_at', $today)
                    ->where('status', 'approved')
                    ->first();

                // Tentukan status absensi
                $status = 'Tanpa Keterangan'; // default
                
                if ($permission) {
                    if ($permission->type === 'sick') {
                        $status = 'Sakit';
                    } elseif ($permission->type === 'permission') {
                        $status = 'Izin';
                    } else {
                        $status = 'Izin';
                    }
                } elseif ($absenHariIni) {
                    // Konversi status dari database ke format yang lebih user-friendly
                    $statusDb = $absenHariIni->status_absen;
                    switch ($statusDb) {
                        case 'HADIR':
                            $status = 'Hadir';
                            break;
                        case 'TERLAMBAT':
                            $status = 'Terlambat';
                            break;
                        case 'IZIN':
                            $status = 'Izin';
                            break;
                        case 'CUTI':
                            $status = 'Cuti';
                            break;
                        case 'TIDAK_HADIR':
                            $status = 'Tidak Hadir';
                            break;
                        default:
                            $status = 'Hadir'; // default jika status tidak dikenali
                    }
                }

                return [
                    'id' => $karyawan->id_karyawan,
                    'name' => $nama,
                    'department' => $karyawan->department->nama_department ?? '-',
                    'jam_kerja' => '08:00 - 17:00',
                    'absen_masuk' => $masuk,
                    'absen_keluar' => $keluar,
                    'status' => $status,
                ];
            });

        // === REKAP MINGGUAN ===
        $weeklyData = collect(range(0, 6))->map(function ($i) {
            $date = now()->startOfWeek()->addDays($i);
            $dateString = $date->toDateString();

            // Hitung Hadir (berdasarkan tabel absen dengan status HADIR atau TERLAMBAT)
            $hadir = DB::table('absen')
                ->whereIn('status_absen', ['HADIR', 'TERLAMBAT'])
                ->whereDate('tanggal_absen', $dateString)
                ->distinct('id_karyawan')
                ->count('id_karyawan');

            // Hitung Izin (permission dengan type = permission)
            $izin = DB::table('permissions')
                ->where('type', 'permission')
                ->where('status', 'approved')
                ->whereDate('created_at', $dateString)
                ->count();

            // Hitung Sakit (permission dengan type = sick)
            $sakit = DB::table('permissions')
                ->where('type', 'sick')
                ->where('status', 'approved')
                ->whereDate('created_at', $dateString)
                ->count();

            // Total karyawan aktif
            $total = DB::table('karyawan')
                ->where('status_aktif', 'AKTIF')
                ->count();
            
            // Tanpa Keterangan = Total - (Hadir + Izin + Sakit)
            $tanpa = max($total - ($hadir + $izin + $sakit), 0);

            return [
                'day' => $date->translatedFormat('D'),
                'date' => $date->format('d M'),
                'hadir' => $hadir,
                'izin' => $izin,
                'sakit' => $sakit,
                'tanpa' => $tanpa,
            ];
        });

        return Inertia::render('admin/Absensi', [
            'absensiData' => $employees,
            'weeklyData' => $weeklyData,
        ]);
    }

    public function inventory()
    {
        // GUNAKAN TABEL GUDANG YANG ADA DI DATABASE ANDA
        $inventories = DB::table('gudang')
            ->select('id', 'nama_barang', 'stok', 'satuan')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'nama_barang' => $item->nama_barang,
                    'department' => 'Gudang', // Default department karena tabel gudang tidak ada kolom department
                    'stok' => $item->stok,
                    'satuan' => $item->satuan,
                ];
            });

        return Inertia::render('admin/Inventory', [
            'inventories' => $inventories
        ]);
    }

    // Method untuk detail berdasarkan status (jika diperlukan)
    public function dashboardDetail($status)
    {
        $today = now()->toDateString();
        
        $employees = Karyawan::with(['department', 'detailKaryawan'])
            ->where('status_aktif', 'AKTIF')
            ->get()
            ->map(function ($karyawan) use ($today, $status) {
                // Ambil data absen
                $absen = Absen::where('id_karyawan', $karyawan->id_karyawan)
                    ->whereDate('tanggal_absen', $today)
                    ->first();

                // Tentukan status karyawan
                $karyawanStatus = 'Tanpa Keterangan';
                if ($absen) {
                    $karyawanStatus = $this->convertStatus($absen->status_absen);
                }

                // Filter berdasarkan status yang diminta
                if ($karyawanStatus !== $status) {
                    return null;
                }

                return [
                    'id' => $karyawan->id_karyawan,
                    'name' => $karyawan->detailKaryawan->nama ?? $karyawan->id_karyawan,
                    'department' => $karyawan->department->nama_department ?? '-',
                    'status' => $karyawanStatus,
                    'waktu_absen' => $absen && $absen->jam_datang 
                        ? Carbon::parse($absen->jam_datang)->format('H:i') 
                        : '-',
                ];
            })
            ->filter() // Hapus null values
            ->values(); // Reset array keys

        return Inertia::render('admin/StatusDetail', [
            'status' => $status,
            'employees' => $employees
        ]);
    }

    // Method helper untuk konversi status
    private function convertStatus($statusDb)
    {
        switch ($statusDb) {
            case 'HADIR':
                return 'Hadir';
            case 'TERLAMBAT':
                return 'Terlambat';
            case 'IZIN':
                return 'Izin';
            case 'CUTI':
                return 'Cuti';
            case 'TIDAK_HADIR':
                return 'Tidak Hadir';
            default:
                return 'Tanpa Keterangan';
        }
    }

    public function requestItem()
    {
        $requests = AdminRequestItem::with(['department', 'detail'])
            ->get()
            ->groupBy('kode_department')
            ->map(function ($group) {
                // Ambil semua detail dari request_items
                $detail = $group->flatMap->detail;

                return [
                    'code' => $group->first()->kode_department,
                    'name' => $group->first()->department->nama_department ?? 'Unknown',
                    'totalRequest' => $group->count(),
                    'completed' => $detail->where('status', 'Completed')->count(),
                    'pending' => $detail->where('status', 'Pending')->count(),
                    'canceled' => $detail->where('status', 'Rejected')->count(),
                    'growth' => rand(-5, 10),
                    'isPositive' => rand(0, 1) == 1,
                    'totalCost' => $detail->sum('total_cost') ?? 0,
                ];
            })
            ->sortByDesc('totalRequest')
            ->values();

        return Inertia::render('admin/RequestItem', [
            'departments' => $requests,
        ]);
    }

    public function requestDetail($dept)
    {
        $requests = AdminRequestItem::with('department', 'detail')
            ->where('kode_department', $dept)
            ->get();

        // Hitung statistik
        $totalOrder = $requests->count();
        $completed = $requests->flatMap->detail->where('status', 'Completed')->count();
        $pending = $requests->flatMap->detail->where('status', 'Pending')->count();
        $canceled = $requests->flatMap->detail->where('status', 'Canceled')->count();

        // Total Cost
        $totalCost = 0;
        foreach ($requests as $req) {
            foreach ($req->detail as $d) {
                $totalCost += ((int) $d->qty * (int) $d->price);
            }
        }

        // Data tabel
        $requestTable = RequestDetail::with('request')
            ->whereHas('request', function ($q) use ($dept) {
                $q->where('kode_department', $dept);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    "id" => $item->id,
                    "item_name" => $item->nama_barang,
                    "qty" => (int) $item->jumlah_diajukan,
                    "price" => (int) $item->price,
                    "created_at" => $item->created_at->format('Y-m-d'),
                    "status" => $item->request->status ?? "unknown",
                    "request_id" => $item->request_id
                ];
            });

        $history = RequestDetail::with('request')
            ->where('status', 'Completed')
            ->whereHas('request', function ($q) use ($dept) {
                $q->where('kode_department', $dept);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    "id" => $item->id,
                    "item_name" => $item->nama_barang,
                    "qty" => (int) $item->jumlah_diajukan,
                    "price" => (int) $item->price,
                    "created_at" => $item->created_at->format('Y-m-d'),
                    "status" => $item->request->status ?? "unknown",
                    "request_id" => $item->request_id
                ];
            });

        return Inertia::render('admin/RequestDetailPage', [
            'deptName' => Department::where('kode_department', $dept)->first()->nama_department ?? 'Unknown',
            'stats' => [
                'totalOrder' => $totalOrder,
                'pending' => $pending,
                'completed' => $completed,
                'canceled' => $canceled,
                'totalCost' => $totalCost
            ],
            'requests' => $requestTable,
            'history' => $history,
        ]);
    }
}