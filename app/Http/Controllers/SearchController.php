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

        // === SPARQL SEARCH ===
       $filter = "";
if ($q !== "") {
    $filter = trim("
        FILTER (
            contains(lcase(str(?productName)), lcase(\"$q\")) ||
            contains(lcase(str(?category)), lcase(\"$q\")) ||
            contains(lcase(str(?brand)), lcase(\"$q\")) ||
            contains(lcase(str(?storeName)), lcase(\"$q\"))
        )
    ");
}

        



       $sparql = <<<SPARQL
PREFIX kawaland: <http://kawaland.org/ontology#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?product ?productName ?price ?image ?category ?brand ?storeName ?storeLocation ?storeLogo
WHERE {
  ?product a kawaland:Product .

  OPTIONAL { ?product kawaland:hasProductName ?productName }
  OPTIONAL { ?product kawaland:hasPrice ?price }
  OPTIONAL { ?product kawaland:hasImage ?image }
  OPTIONAL { ?product kawaland:hasCategory ?category }
  OPTIONAL { ?product kawaland:hasBrand ?brand }
  OPTIONAL { ?product kawaland:soldBy ?store }
  OPTIONAL { ?store kawaland:hasStoreName ?storeName }
  OPTIONAL { ?store kawaland:hasLocation ?storeLocation }
  OPTIONAL { ?store kawaland:logo_toko ?storeLogo }

  ".($filter ?: "")."
}
SPARQL;


        $bindings = $this->fuseki->query($sparql);

        // === MAPPING & PARSING ===
        $mapped = collect($bindings)->map(function ($row) {

            // sementara: jarak & rating dibuat dummy random
            // nanti tinggal ganti sesuai RDF kamu
            $dummyDistance = rand(1, 100);
            $dummyRating   = rand(1, 5);

            return [
                'id'    => $row['product']['value'] ?? null,
                'name'  => $row['productName']['value'] ?? null,
                'price' => isset($row['price']['value']) ? (int)$row['price']['value'] : null,
                'distance' => $dummyDistance,
                'rating'   => $dummyRating,
                'image'    => $row['image']['value'] ?? null,
                'category' => $row['category']['value'] ?? null,

                'store' => [
                    'name'     => $row['storeName']['value'] ?? null,
                    'location' => $row['storeLocation']['value'] ?? null,
                    'logo'     => $row['storeLogo']['value'] ?? null,
                ]
            ];
        });

        // === SORTING BERURUTAN (TRIPLE SORTING) ===
        if ($sortPrice === 'lowest') {
            $mapped = $mapped->sortBy('price');
        } elseif ($sortPrice === 'highest') {
            $mapped = $mapped->sortByDesc('price');
        }

        if ($sortDistance === 'nearest') {
            $mapped = $mapped->sortBy('distance')->values();
        } elseif ($sortDistance === 'farthest') {
            $mapped = $mapped->sortByDesc('distance')->values();
        }

        if ($sortRating === 'highest') {
            $mapped = $mapped->sortByDesc('rating')->values();
        } elseif ($sortRating === 'lowest') {
            $mapped = $mapped->sortBy('rating')->values();
        }

        // === PAGINATION ===
        $total      = $mapped->count();
        $totalPages = ceil($total / $perPage);
        $data       = $mapped->slice(($page - 1) * $perPage, $perPage)->values();

        return response()->json([
            'success'    => true,
            'data'       => $data,
            'page'       => $page,
            'totalPages' => $totalPages,
            'totalItems' => $total,
        ]);
    }
}
