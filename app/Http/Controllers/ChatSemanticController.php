<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\Semantic\FusekiService;

class ChatSemanticController extends Controller
{
    public function __construct(
        protected FusekiService $fuseki
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $text = $request->get('message', '');

        // 1) Parsing query alami → filter terstruktur
        $parsed = $this->parseUserText($text);
        // $parsed = ['q' => 'ember lipat', 'location' => 'batam', 'min_price' => null, 'max_price' => 100000];

        // 2) Bangun SPARQL dari filter ini
        $sparql = $this->buildSparql($parsed);

        $bindings = $this->fuseki->query($sparql);

        $products = collect($bindings)->map(function ($row) {
            return [
                'id'       => $row['product']['value'] ?? null,
                'name'     => $row['productName']['value'] ?? null,
                'price'    => isset($row['price']['value']) ? (int)$row['price']['value'] : null,
                'image'    => $row['image']['value'] ?? null,
                'category' => $row['category']['value'] ?? null,
                'store'    => [
                    'name'     => $row['storeName']['value'] ?? null,
                    'location' => $row['storeLocation']['value'] ?? null,
                    'logo'     => $row['storeLogo']['value'] ?? null,
                ],
            ];
        })->values();

        // 3) Jawaban teks ala chatbot
        $replyText = $this->buildReplyText($parsed, $products->count());

        return response()->json([
            'success'  => true,
            'message'  => $replyText,
            'filters'  => $parsed,
            'products' => $products,
        ]);
    }

    /**
     * NLP SEDERHANA: parse kalimat user -> keyword, lokasi, range harga
     */
    protected function parseUserText(string $text): array
    {
        $lower = mb_strtolower($text, 'UTF-8');

        // --- keyword dasar (buang kata-kata umum) ---
        $q = $lower;
        $stopwords = ['cari', 'tolong', 'dong', 'ya', 'yang', 'di', 'untuk', 'dengan', 'lagi', 'mau', 'tapi'];
        foreach ($stopwords as $stop) {
            $q = str_replace(' ' . $stop . ' ', ' ', $q);
        }
        $q = trim($q);

        // --- lokasi simpel ---
        $location = null;
        if (str_contains($lower, 'batam')) {
            $location = 'batam';
        } elseif (str_contains($lower, 'tanjung pinang') || str_contains($lower, 'tanjungpinang')) {
            $location = 'tanjung pinang';
        } elseif (str_contains($lower, 'kepulauan riau') || str_contains($lower, 'kepri')) {
            $location = 'kepulauan riau';
        }

        // --- harga: "di bawah 100 ribu", "max 200k", "kurang dari 50.000" ---
        $minPrice = null;
        $maxPrice = null;

        // angka + kata 'ribu' / 'juta'
        if (preg_match_all('/(\d+)\s*(ribu|rb|k|juta|jt)?/i', $text, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $m) {
                $num = (int)$m[1];
                $unit = strtolower($m[2] ?? '');

                if (in_array($unit, ['ribu', 'rb', 'k'])) {
                    $num *= 1000;
                } elseif (in_array($unit, ['juta', 'jt'])) {
                    $num *= 1000000;
                }

                // cek konteks: "di bawah", "kurang dari", "maksimal"
                if (preg_match('/(di bawah|kurang dari|max|maks|maksimal)/i', $lower)) {
                    $maxPrice = $num;
                } elseif (preg_match('/(di atas|minimal|min)/i', $lower)) {
                    $minPrice = $num;
                }
            }
        }

        // fallback: kalau ada kata “murah” tapi nggak ada angka → set maxPrice default
        if ($maxPrice === null && str_contains($lower, 'murah')) {
            $maxPrice = 100000; // 100k default
        }

        return [
            'q'         => $q,
            'location'  => $location,
            'min_price' => $minPrice,
            'max_price' => $maxPrice,
        ];
    }

    /**
     * Bangun SPARQL dari hasil parsing NLP
     */
    protected function buildSparql(array $f): string
    {
        $q          = addslashes($f['q'] ?? '');
        $location   = $f['location'];
        $minPrice   = $f['min_price'];
        $maxPrice   = $f['max_price'];

        $filters = [];

        if ($q !== '') {
            $filters[] = "
      (contains(lcase(str(?productName)), lcase(\"$q\")) ||
       contains(lcase(str(?category)), lcase(\"$q\")) ||
       contains(lcase(str(?brand)), lcase(\"$q\")) ||
       contains(lcase(str(?storeName)), lcase(\"$q\")))";
        }

        if ($location) {
            $loc = addslashes($location);
            $filters[] = "contains(lcase(str(?storeLocation)), lcase(\"$loc\"))";
        }

        if ($minPrice !== null) {
            $filters[] = "xsd:decimal(?price) >= $minPrice";
        }

        if ($maxPrice !== null) {
            $filters[] = "xsd:decimal(?price) <= $maxPrice";
        }

        $filterBlock = '';
        if (!empty($filters)) {
            $filterBlock = "FILTER(" . implode(' && ', $filters) . ")";
        }

        return <<<SPARQL
PREFIX kawaland: <http://kawaland.org/ontology#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?product ?productName ?price ?image ?category ?brand ?storeName ?storeLocation ?storeLogo
WHERE {
  ?product a kawaland:Product ;
           kawaland:hasProductName ?productName ;
           kawaland:hasPrice ?price .

  OPTIONAL { ?product kawaland:hasImage ?image }
  OPTIONAL { ?product kawaland:hasCategory ?category }
  OPTIONAL { ?product kawaland:hasBrand ?brand }
  OPTIONAL { ?product kawaland:soldBy ?store }
  OPTIONAL { ?store kawaland:hasStoreName ?storeName }
  OPTIONAL { ?store kawaland:hasLocation ?storeLocation }
  OPTIONAL { ?store kawaland:logo_toko ?storeLogo }

  $filterBlock
}
LIMIT 30
SPARQL;
    }

    /**
     * Jawaban teks singkat ala chatbot
     */
    protected function buildReplyText(array $f, int $count): string
    {
        if ($count === 0) {
            return "Maaf, aku belum menemukan produk yang cocok dengan permintaanmu 😢. Coba ganti kata kunci atau harga ya.";
        }

        $parts = [];

        if ($f['q']) {
            $parts[] = "untuk \"" . $f['q'] . "\"";
        }
        if ($f['location']) {
            $parts[] = "di area " . ucfirst($f['location']);
        }
        if ($f['max_price']) {
            $parts[] = "dengan harga maksimal " . number_format($f['max_price'], 0, ',', '.');
        }

        $filterText = $parts ? ' ' . implode(' ', $parts) : '';

        return "Aku menemukan {$count} produk{$filterText}. Ini beberapa yang cocok buatmu 👇";
    }
}
