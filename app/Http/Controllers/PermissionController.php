<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;




class PermissionController extends Controller{
    public function index()
    {
        $permissions = Permission::where('user_id', Auth::id())
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($permission) {
                return [
                    'id' => (string) $permission->id,
                    'type' => $permission->type,
                    'status' => $permission->status,
                    'createdBy' => $permission->user->name ?? 'Unknown',
                    'createdDate' => $permission->created_at->format('Y-m-d'),
                    'startDate' => $permission->start_date,
                    'endDate' => $permission->end_date,
                    'days' => $permission->days,
                    'sickType' => $permission->sick_type,
                    'notes' => $permission->notes,
                    'date' => $permission->permission_date,
                    'reason' => $permission->reason,
                    'permissionType' => $permission->permission_type,
                    'time' => $permission->time,
                    'vacationType' => $permission->vacation_type,
                    'location' => $permission->location,
                    'document_path' => $permission->document_path, // Tambahkan ini
                    'document_url' => $permission->document_path ? Storage::url($permission->document_path) : null, // URL untuk akses file
                ];
            });

        return response()->json($permissions);
    }

 public function store(Request $request)
{
    Log::info('Permission Store Request:', $request->all());
    Log::info('Files:', $request->file() ? ['has_file' => true] : ['has_file' => false]);

    // Validation rules
    $validated = $request->validate([
        'type' => 'required|in:sick,permission,vacation',
        'start_date' => 'nullable|date',
        'end_date' => 'nullable|date|after_or_equal:start_date',
        'sick_type' => 'nullable|in:ringan,sedang,berat',
        'notes' => 'nullable|string',
        'permission_date' => 'nullable|date',
        'reason' => 'nullable|string',
        'permission_type' => 'nullable|in:Tidak hadir,datang terlambat,WFH',
        'vacation_type' => 'nullable|in:Cuti Tahunan,Cuti Bersama,Cuti Sakit,Cuti Maternity',
        'vacation_reason' => 'nullable|string',
        'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        'time' => 'nullable|string',
        'location' => 'nullable|string',
        'days' => 'nullable|integer',
    ]);

    Log::info('Validated Data:', $validated);

    // Validasi khusus untuk datang terlambat
    if ($request->permission_type === 'datang terlambat' && 
        $request->permission_date === now()->format('Y-m-d')) {
        return response()->json([
            'message' => 'Izin datang terlambat tidak dapat dibuat pada hari yang sama'
        ], 422);
    }

    // Calculate days if not provided
    if ($request->start_date && $request->end_date && !$request->days) {
        $start = new \DateTime($request->start_date);
        $end = new \DateTime($request->end_date);
        $validated['days'] = $end->diff($start)->days + 1;
    }

    // Handle file upload - SIMPAN FULL PATH
    $documentPath = null;
    if ($request->hasFile('document')) {
        Log::info('File detected:', [
            'name' => $request->file('document')->getClientOriginalName(),
            'size' => $request->file('document')->getSize(),
            'mime' => $request->file('document')->getMimeType()
        ]);

        $file = $request->file('document');
        
        // Generate unique filename
        $fileName = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
        
        // Store file dan dapatkan full path
        $path = $file->storeAs('permissions', $fileName, 'public');
        $documentPath = $path;
        
        Log::info('File stored:', [
            'fileName' => $fileName,
            'path' => $path,
            'full_path' => $documentPath
        ]);

        // Simpan full path ke database
        $validated['document_path'] = $documentPath;
    } else {
        Log::info('No file uploaded or file validation failed');
    }

    // Hapus field document dari validated data karena bukan bagian dari model
    unset($validated['document']);

    Log::info('Data before create:', $validated);

    // Set default values
    $validated['user_id'] = Auth::id();
    $validated['status'] = 'pending';
    
    // Set location based on type if not provided
    if (!isset($validated['location'])) {
        $validated['location'] = $request->type === 'vacation' ? 'TBD' : 'Online';
    }
    
    // Set time for permission if not provided
    if ($request->type === 'permission' && !isset($validated['time'])) {
        $validated['time'] = now()->format('H:00') . ' - ' . now()->addHour()->format('H:00');
    }

    // Create permission
    $permission = Permission::create($validated);
    $permission->load('user');

    Log::info('Permission created:', [
        'id' => $permission->id,
        'document_path' => $permission->document_path
    ]);

    return response()->json([
        'message' => 'Permission berhasil dibuat',
        'permission' => [
            'id' => (string) $permission->id,
            'type' => $permission->type,
            'status' => $permission->status,
            'createdBy' => $permission->user->name ?? 'Unknown',
            'createdDate' => $permission->created_at->format('Y-m-d'),
            'startDate' => $permission->start_date,
            'endDate' => $permission->end_date,
            'days' => $permission->days,
            'sickType' => $permission->sick_type,
            'notes' => $permission->notes,
            'date' => $permission->permission_date,
            'reason' => $permission->reason,
            'permissionType' => $permission->permission_type,
            'time' => $permission->time,
            'vacationType' => $permission->vacation_type,
            'location' => $permission->location,
            'document_path' => $permission->document_path, // Full path
            'document_url' => $permission->document_path ? Storage::url($permission->document_path) : null, // Full URL
        ]
    ], 201);
}

    public function update(Request $request, $id)
    {
        try {
            // Cari permission milik user yang login
            $permission = Permission::where('user_id', Auth::id())->findOrFail($id);
            
            // Validasi input
            $validated = $request->validate([
                'type' => 'required|in:sick,permission,vacation',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'sick_type' => 'nullable|in:ringan,sedang,berat',
                'notes' => 'nullable|string',
                'permission_type' => 'nullable|in:Tidak hadir,datang terlambat,WFH',
                'time' => 'nullable|string',
                'vacation_type' => 'nullable|in:Cuti Tahunan,Cuti Bersama,Cuti Sakit,Cuti Maternity',
                'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            ]);

            // Pastikan status masih pending saat edit
            if ($permission->status !== 'pending') {
                return response()->json([
                    'message' => 'Hanya permission dengan status "Pending" yang dapat diedit'
                ], 422);
            }

            // Handle file upload jika ada file baru
            if ($request->hasFile('document')) {
                // Hapus file lama jika ada
                if ($permission->document_path) {
                    Storage::disk('public')->delete($permission->document_path);
                }

                $file = $request->file('document');
                $fileName = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('permissions', $fileName, 'public');
                $validated['document_path'] = $path;
            }

            // Hapus field document dari validated data
            unset($validated['document']);

            // Hitung ulang jumlah hari jika tanggal berubah
            if ($validated['start_date'] && $validated['end_date']) {
                $start = new \DateTime($validated['start_date']);
                $end = new \DateTime($validated['end_date']);
                $validated['days'] = $end->diff($start)->days + 1;
            }

            // Update permission
            $permission->update($validated);
            $permission->load('user');

            return response()->json([
                'message' => 'Permission berhasil diperbarui',
                'permission' => [
                    'id' => (string) $permission->id,
                    'type' => $permission->type,
                    'status' => $permission->status,
                    'createdBy' => $permission->user->name ?? 'Unknown',
                    'createdDate' => $permission->created_at->format('Y-m-d'),
                    'startDate' => $permission->start_date,
                    'endDate' => $permission->end_date,
                    'days' => $permission->days,
                    'sickType' => $permission->sick_type,
                    'notes' => $permission->notes,
                    'permissionType' => $permission->permission_type,
                    'time' => $permission->time,
                    'vacationType' => $permission->vacation_type,
                    'document_path' => $permission->document_path,
                    'document_url' => $permission->document_path ? Storage::url($permission->document_path) : null,
                ]
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Permission tidak ditemukan'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $permission = Permission::where('user_id', Auth::id())->findOrFail($id);
        
        // Hapus file dari storage jika ada
        if ($permission->document_path) {
            Storage::disk('public')->delete($permission->document_path);
        }
        
        $permission->delete();

        return response()->json(['message' => 'Permission berhasil dihapus']);
    }

    // Method untuk download file
    public function downloadDocument($id)
    {
        $permission = Permission::where('user_id', Auth::id())->findOrFail($id);
        
        if (!$permission->document_path) {
            return response()->json(['message' => 'File tidak ditemukan'], 404);
        }

        if (!Storage::disk('public')->exists($permission->document_path)) {
            return response()->json(['message' => 'File tidak ditemukan di storage'], 404);
        }

        return Storage::disk('public')->download($permission->document_path);
    }
}