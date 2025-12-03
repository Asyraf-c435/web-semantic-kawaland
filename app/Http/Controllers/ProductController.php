<?php

namespace App\Http\Controllers;

use App\Services\Semantic\FusekiService;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function __construct(
        protected FusekiService $fuseki
    ) {}

      private array $coords = [
        'batam' => [
            [1.132265, 104.033717],
            [1.136632, 104.033323],
            [1.138570, 104.033578],
            [1.124153, 104.029673],
            [1.115695, 104.035629],
            [1.108789, 104.042101],
            [1.108634, 104.051995],
            [1.125191, 104.066699],
            [1.115796, 104.067881],
            [1.112779, 104.092211],
            [1.128228, 104.102827],
            [1.128490, 104.099009],
            [1.131343, 104.004611],
            [1.140303, 104.007114],
            [1.140706, 104.032302],
            [1.150473, 104.014057],
            [1.171054, 104.013895],
            [1.188125, 104.017851],
            [1.136185, 104.108521],
            [1.124675, 104.063068],
            [1.102553, 104.047449],
        ],
        'pinang' => [
            [0.940747, 104.476696],
            [0.915552, 104.533966],
            [0.880430, 104.528621],
            [0.944565, 104.556111],
            [0.890356, 104.498077],
            [0.903336, 104.540839],
            [0.859816, 104.545420],
            [0.985793, 104.476696],
            [0.927768, 104.493495],
            [0.950673, 104.555347],
            [0.962125, 104.624834],
            [0.907064, 104.544307],
        ],
        'kepri' => [
            [0.957667, 103.940402],
            [0.835869, 103.771074],
            [0.732332, 104.238132],
            [1.133244, 103.971556],
            [1.078176, 104.326257],
            [1.086987, 104.257960],
            [1.146460, 104.548771],
            [1.058352, 104.619270],
            [0.961430, 104.588426],
        ],
    ];

    // 2. HELPER PEMILIH KOORDINAT
    private function getCoordinateByLocation(?string $location, int $index): array
    {
        if (!$location) {
            // kalau lokasi kosong → random dari salah satu region
            $region = array_rand($this->coords);
            return $this->coords[$region][$index % count($this->coords[$region])];
        }

        $location = strtolower($location);

        if (str_contains($location, 'batam')) {
            return $this->coords['batam'][$index % count($this->coords['batam'])];
        }

        if (str_contains($location, 'tanjung') || str_contains($location, 'pinang')) {
            return $this->coords['pinang'][$index % count($this->coords['pinang'])];
        }

        // default: Kepulauan Riau
        return $this->coords['kepri'][$index % count($this->coords['kepri'])];
    }


    public function show(string $id): JsonResponse
    {
        // ID yang dipakai bisa "product:09_001" atau "09_001"
        // Kalau dari UI kamu kirim "product:09_001", kita pakai STR(?product) = "product:09_001"
        $sparql = <<<SPARQL
PREFIX kawaland: <http://kawaland.org/ontology#>

SELECT ?product ?productName ?price ?image ?category ?brand ?condition ?description
       ?productLink ?rating ?reviewCount ?stock ?semanticTags
       ?store ?storeName ?storeLocation ?storeLogo
WHERE {
  ?product a kawaland:Product .

  FILTER(STR(?product) = "$id")

  OPTIONAL { ?product kawaland:hasProductName ?productName }
  OPTIONAL { ?product kawaland:hasPrice ?price }
  OPTIONAL { ?product kawaland:hasImage ?image }
  OPTIONAL { ?product kawaland:hasCategory ?category }
  OPTIONAL { ?product kawaland:hasBrand ?brand }
  OPTIONAL { ?product kawaland:hasCondition ?condition }
  OPTIONAL { ?product kawaland:hasDescription ?description }
  OPTIONAL { ?product kawaland:hasProductLink ?productLink }
  OPTIONAL { ?product kawaland:hasRating ?rating }
  OPTIONAL { ?product kawaland:hasReviewCount ?reviewCount }
  OPTIONAL { ?product kawaland:hasStock ?stock }
  OPTIONAL { ?product kawaland:hasSemanticTags ?semanticTags }

  OPTIONAL {
    ?product kawaland:soldBy ?store .
    OPTIONAL { ?store kawaland:hasStoreName ?storeName }
    OPTIONAL { ?store kawaland:hasLocation ?storeLocation }
    OPTIONAL { ?store kawaland:logo_toko ?storeLogo }
  }
}
LIMIT 1
SPARQL;

        $bindings = $this->fuseki->query($sparql);

        if (empty($bindings)) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan',
            ], 404);
        }

        $row = $bindings[0];

        // 🧮 Data produk yang sudah dirapikan
        $product = [
            'id'          => $id,
            'name'        => $row['productName']['value'] ?? null,
            'price'       => isset($row['price']['value']) ? (int) $row['price']['value'] : null,
            'image'       => $row['image']['value'] ?? null,
            'category'    => $row['category']['value'] ?? null,
            'brand'       => $row['brand']['value'] ?? null,
            'condition'   => $row['condition']['value'] ?? null,
            'description' => $row['description']['value'] ?? null,
            'productLink' => $row['productLink']['value'] ?? null,
            'rating'      => $row['rating']['value'] ?? null,
            'reviewCount' => isset($row['reviewCount']['value']) ? (int)$row['reviewCount']['value'] : null,
            'stock'       => isset($row['stock']['value']) ? (int)$row['stock']['value'] : null,
            'semanticTags'=> $row['semanticTags']['value'] ?? null,
            'store'       => [
                'id'       => $row['store']['value'] ?? null,
                'name'     => $row['storeName']['value'] ?? null,
                'location' => $row['storeLocation']['value'] ?? null,
                'logo'     => $row['storeLogo']['value'] ?? null,
            ],
        ];

       // 📍 Basis koordinat toko (Batam)
$baseLat = 1.083338;
$baseLng = 104.635812;

// 📍 Koordinat pembeli (posisi referensi)
$userLat = 1.116301;
$userLng = 104.036934;

// Ambil lokasi toko dari RDF
$storeLocation = $product['store']['location'] ?? null;

// Pilih koordinat dari daftar sesuai lokasi
$randomCoord = $this->getCoordinateByLocation($storeLocation, rand(0, 100));

$lat = $randomCoord[0];
$lng = $randomCoord[1];

$distance = $this->calculateDistance($userLat, $userLng, $lat, $lng);

$status = $distance > 10 ? 'Jauh' : 'Dekat';

        return response()->json([
            'success' => true,
            'data' => $product,
            'location' => [
                'latitude'     => $lat,
                'longitude'    => $lng,
                'distance_km'  => round($distance, 2),
                'status'       => $status,
                'user_lat'     => $userLat,
                'user_lng'     => $userLng,
                'base_lat'     => $baseLat,
                'base_lng'     => $baseLng,
            ],
        ]);
    }

    // 🔢 Haversine: hitung jarak antar dua titik koordinat dalam KM
    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
