<?php

namespace App\Http\Controllers;

use App\Services\Semantic\FusekiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    public function __construct(
        protected FusekiService $fuseki
    ) {}

    public function index(Request $request): JsonResponse
    {
        $page     = (int)$request->get('page', 1);
        $perPage  = (int)$request->get('per_page', 20);
        $q        = strtolower(trim($request->get('q', '')));

        $sortPrice    = $request->get('sort_price');
        $sortDistance = $request->get('sort_distance');
        $sortRating   = $request->get('sort_rating');

        // === BUILD SPARQL FILTER (Safe from injection) ===
        $filter = "";
        if ($q !== "") {
            $qEscaped = addslashes($q);
            $filter = "FILTER (
                contains(lcase(str(?productName)), \"$qEscaped\") ||
                contains(lcase(str(?category)), \"$qEscaped\") ||
                contains(lcase(str(?brand)), \"$qEscaped\") ||
                contains(lcase(str(?storeName)), \"$qEscaped\")
            )";
        }

        $sparql = <<<SPARQL
PREFIX kawaland: <http://kawaland.org/ontology#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?product ?productName ?price ?image ?category ?brand ?storeName ?storeLocation ?storeLogo ?productLink ?rating ?stock
WHERE {
  ?product a kawaland:Product .

  OPTIONAL { ?product kawaland:hasProductName ?productName }
  OPTIONAL { ?product kawaland:hasPrice ?price }
  OPTIONAL { ?product kawaland:hasImage ?image }
  OPTIONAL { ?product kawaland:hasCategory ?category }
  OPTIONAL { ?product kawaland:hasBrand ?brand }
  OPTIONAL { ?product kawaland:hasProductLink ?productLink }
  OPTIONAL { ?product kawaland:hasRating ?rating }
  OPTIONAL { ?product kawaland:hasStock ?stock }
  OPTIONAL { ?product kawaland:soldBy ?store }
  OPTIONAL { ?store kawaland:hasStoreName ?storeName }
  OPTIONAL { ?store kawaland:hasLocation ?storeLocation }
  OPTIONAL { ?store kawaland:logo_toko ?storeLogo }

  $filter
}
SPARQL;

        $bindings = $this->fuseki->query($sparql);

        // === MAPPING & PARSING ===
        $mapped = collect($bindings)->map(function ($row) {
            $rating = $row['rating']['value'] ?? null;
            
            // Convert rating string to numeric
            $ratingNumeric = null;
            if ($rating && $rating !== "No Rating") {
                $ratingNumeric = (float) filter_var(
                    $rating, 
                    FILTER_SANITIZE_NUMBER_FLOAT, 
                    FILTER_FLAG_ALLOW_FRACTION
                );
            }

            return [
                'id'    => $row['product']['value'] ?? null,
                'name'  => $row['productName']['value'] ?? null,
                'price' => isset($row['price']['value']) ? (int)$row['price']['value'] : null,
                'distance' => $this->generateDistanceByLocation($row['storeLocation']['value'] ?? null),
                'rating'   => $ratingNumeric ?? 0,
                'image'    => $row['image']['value'] ?? null,
                'category' => $row['category']['value'] ?? null,
                'brand'    => $row['brand']['value'] ?? null,
                'productLink' => $row['productLink']['value'] ?? null,
                'stock'    => isset($row['stock']['value']) ? (int)$row['stock']['value'] : null,
                'store' => [
                    'name'     => $row['storeName']['value'] ?? null,
                    'location' => $row['storeLocation']['value'] ?? null,
                    'logo'     => $row['storeLogo']['value'] ?? null,
                ]
            ];
        })->filter(function ($item) {
            return $item['id'] && $item['name'];
        });

        // === SORTING ===
        $sorted = $this->applySorting($mapped, $sortPrice, $sortDistance, $sortRating);

        // === PAGINATION ===
        $total      = $sorted->count();
        $totalPages = $total > 0 ? ceil($total / $perPage) : 1;
        $data       = $sorted->slice(($page - 1) * $perPage, $perPage)->values();

        return response()->json([
            'success'    => true,
            'data'       => $data,
            'page'       => $page,
            'perPage'    => $perPage,
            'totalPages' => $totalPages,
            'totalItems' => $total,
            'filters'    => [
                'query'        => $q,
                'sortPrice'    => $sortPrice,
                'sortDistance' => $sortDistance,
                'sortRating'   => $sortRating,
            ]
        ]);
    }

    /**
     * Apply multiple sorting criteria
     */
    private function applySorting($collection, $sortPrice, $sortDistance, $sortRating)
    {
        // Price sorting
        if ($sortPrice === 'lowest') {
            $collection = $collection->sortBy('price');
        } elseif ($sortPrice === 'highest') {
            $collection = $collection->sortByDesc('price');
        }

        // Distance sorting
        if ($sortDistance === 'nearest') {
            $collection = $collection->sortBy('distance')->values();
        } elseif ($sortDistance === 'farthest') {
            $collection = $collection->sortByDesc('distance')->values();
        }

        // Rating sorting
        if ($sortRating === 'highest') {
            $collection = $collection->sortByDesc('rating')->values();
        } elseif ($sortRating === 'lowest') {
            $collection = $collection->sortBy('rating')->values();
        }

        return $collection;
    }

    /**
     * Generate realistic distance based on store location
     */
    private function generateDistanceByLocation(?string $location): float
    {
        $distances = [
            'batam'          => 5,
            'tanjung pinang' => 45,
            'pinang'         => 45,
            'kepri'          => 65,
            'medan'          => 1400,
            'jakarta'        => 1150,
        ];

        if (!$location) {
            return (float) rand(5, 70);
        }

        $location = strtolower($location);

        foreach ($distances as $key => $distance) {
            if (str_contains($location, $key)) {
                // Add small variance (±20%)
                $variance = $distance * 0.2;
                return round($distance + (rand(-100, 100) / 100 * $variance), 1);
            }
        }

        return (float) rand(5, 70);
    }
}