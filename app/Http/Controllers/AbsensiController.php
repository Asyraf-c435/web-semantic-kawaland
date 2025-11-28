<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Absen;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Cloudinary\Cloudinary;

class AbsensiController extends Controller
{
  public function store(Request $request)
  {
    try {
      // Validasi data
      $validated = $request->validate([
        'foto' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        'tipe_absen' => 'required|in:masuk,pulang',
        'waktu_absen' => 'required|string',
        'lokasi' => 'required|string',
        'device_info' => 'required|string',
        'ip_address' => 'required|string'
      ]);

      if (!$request->hasFile('foto')) {
        return response()->json([
          'success' => false,
          'message' => 'Tidak ada file foto dikirim ke server.'
        ], 400);
      }

      try {
        $cloudinary = new Cloudinary([
          'cloud' => [
            'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
            'api_key' => env('CLOUDINARY_KEY'),
            'api_secret' => env('CLOUDINARY_SECRET'),
          ],
          'url' => [
            'secure' => true
          ]
        ]);

        $uploadResult = $cloudinary->uploadApi()->upload(
          $request->file('foto')->getRealPath(),
          ['folder' => 'absensi_kawaland']
        );

        $imageUrl = $uploadResult['secure_url'];

      } catch (\Exception $e) {
        Log::error('Cloudinary upload gagal:', [$e->getMessage()]);
        return response()->json([
          'success' => false,
          'message' => 'Upload ke Cloudinary gagal: ' . $e->getMessage(),
        ], 500);
      }

      Absen::create([
        'id_absensi' => Auth::id(),
        'tipe_absen' => strtoupper($validated['tipe_absen']) === 'MASUK' ? 'DATANG' : 'BALIK',
        'waktu_absen' => date('Y-m-d H:i:s', strtotime($validated['waktu_absen'])),
        'lokasi' => $validated['lokasi'],
        'link_gambar' => $imageUrl,
        'device_info' => $validated['device_info'],
        'ip_address' => $validated['ip_address']
      ]);

      return response()->json([
        'success' => true,
        'url' => $imageUrl
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Gagal menyimpan absensi: ' . $e->getMessage()
      ], 500);
    }
  }

  public function getRiwayat()
  {
    $absensi = Absen::where('id_absensi', Auth::id())
      ->orderBy('waktu_absen', 'desc')
      ->get();

    return response()->json([
      'success' => true,
      'data' => $absensi
    ]);
  }
}
