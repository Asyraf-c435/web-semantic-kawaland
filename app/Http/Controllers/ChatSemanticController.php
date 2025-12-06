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

    /* ==========================================================
     |  ENTRY POINT
     ========================================================== */
    public function handle(Request $request): JsonResponse
    {
        try {
            $text = trim($request->get('message', ''));

            if ($text === '') {
                return response()->json([
                    'success' => false,
                    'message' => 'Silakan ketik pencarian 🙏',
                    'products' => [],
                ]);
            }

            $parsed = $this->parseUserText($text);
            $sparql = $this->buildSparql($parsed);

            $bindings = $this->fuseki->query($sparql);

            $products = collect($bindings)->map(fn ($r) => [
                'id'    => $r['product']['value'] ?? null,
                'name'  => $r['productName']['value'] ?? null,
                'price' => isset($r['price']['value']) ? (int) $r['price']['value'] : null,
                'category' => $r['category']['value'] ?? null,
                'store' => [
                    'name' => $r['storeName']['value'] ?? null,
                    'location' => $r['storeLocation']['value'] ?? null,
                ],
            ])->filter(fn ($p) => $p['id'])->values();

            return response()->json([
                'success' => true,
                'message' => $this->buildReplyText($parsed, $products->count()),
                'filters' => $parsed,
                'products' => $products,
            ]);

        } catch (\Throwable $e) {
            \Log::error($e);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem',
                'products' => [],
            ], 500);
        }
    }

    /* ==========================================================
     |  LEXICON NLP (OTAK BAHASA)
     ========================================================== */
    protected array $nlpLexicon = [

        // ===== TYPO =====
        'typo' => [
            'kopi' => ['kpi','kopii','kopy'],
            'teh' => ['tee','tehh','teeh'],
            'air' => ['aer','airr'],
            'beras' => ['brs','beraz'],
            'buah' => ['buah2','bua'],
            'coklat' => ['cokelat','choco'],
            'daging' => ['dagingg','beef'],
            'dimsum' => ['dim sum','dimsu','dimssum'],
            'kentang' => ['kentang goreng','french fries','fries'],
            'gula' => ['gulla','suggar'],
            'mie' => ['mi','mii','noodle'],
            'roti' => ['bread','rto'],
            'smooked beef' => ['smoked beef','smok beef','smooked'],
            'telur' => ['telorr','egg'],
            'coca cola' => ['cola','cocacola','coca-cola'],
        ],

        // ===== ENTITY =====
        'entities' => [
            'air mineral',
            'kopi',
            'teh',
            'beras',
            'buah',
            'coklat',
            'daging',
            'dimsum',
            'kentang',
            'gula',
            'mie',
            'roti',
            'smooked beef',
            'telur',
            'coca cola',
        ],

        // ===== HARGA =====
        'price_intent' => [
            'murah' => ['murah','hemat','ekonomis','terjangkau'],
            'mahal' => ['mahal','premium','branded'],
        ],
    ];

    /* ==========================================================
     |  NLP PARSER
     ========================================================== */
    protected function parseUserText(string $text): array
    {
        $lower = mb_strtolower($text, 'UTF-8');
        $clean = preg_replace('/[^a-z0-9\s]/u', ' ', $lower);

        // TYPO FIX
        foreach ($this->nlpLexicon['typo'] as $correct => $variants) {
            foreach ($variants as $v) {
                $clean = str_replace($v, $correct, $clean);
            }
        }

        // ENTITY
        $q = '';
        foreach ($this->nlpLexicon['entities'] as $entity) {
            if (str_contains($clean, $entity)) {
                $q = $entity;
                break;
            }
        }

        // LOCATION
        $location = null;
        if (str_contains($clean, 'batam')) {
            $location = 'batam';
        } elseif (str_contains($clean, 'tanjung pinang') || str_contains($clean, 'tp')) {
            $location = 'tanjung pinang';
        } elseif (str_contains($clean, 'bintan')) {
            $location = 'bintan';
        }

        // HARGA
        $minPrice = null;
        $maxPrice = null;

        foreach ($this->nlpLexicon['price_intent']['murah'] as $kw) {
            if (str_contains($clean, $kw)) {
                $maxPrice = 100000;
            }
        }

        foreach ($this->nlpLexicon['price_intent']['mahal'] as $kw) {
            if (str_contains($clean, $kw)) {
                $minPrice = 150000;
            }
        }

        if (preg_match('/(\d+)\s*(ribu|rb|k|juta|jt)?/i', $clean, $m)) {
            $num = (int) $m[1];
            $unit = strtolower($m[2] ?? '');

            if (in_array($unit, ['ribu','rb','k'])) $num *= 1000;
            if (in_array($unit, ['juta','jt'])) $num *= 1000000;

            if (preg_match('/(dibawah|kurang|max)/i', $clean)) {
                $maxPrice = $num;
            } elseif (preg_match('/(diatas|min)/i', $clean)) {
                $minPrice = $num;
            }
        }

        return [
            'q' => $q ?: trim($clean),
            'location' => $location,
            'min_price' => $minPrice,
            'max_price' => $maxPrice,
        ];
    }

    /* ==========================================================
     |  SPARQL BUILDER
     ========================================================== */
    protected function buildSparql(array $f): string
    {
        $filters = [];

        if (!empty($f['q'])) {
            $q = addslashes($f['q']);
            $filters[] = "
              (
                CONTAINS(LCASE(STR(?productName)), LCASE(\"$q\")) ||
                CONTAINS(LCASE(STR(?category)), LCASE(\"$q\")) ||
                CONTAINS(LCASE(STR(?brand)), LCASE(\"$q\")) ||
                CONTAINS(LCASE(STR(?storeName)), LCASE(\"$q\"))
              )
            ";
        }

        if ($f['location']) {
            $loc = addslashes($f['location']);
            $filters[] = "CONTAINS(LCASE(STR(?storeLocation)), LCASE(\"$loc\"))";
        }

        if ($f['min_price'])
            $filters[] = "xsd:decimal(?price) >= {$f['min_price']}";

        if ($f['max_price'])
            $filters[] = "xsd:decimal(?price) <= {$f['max_price']}";

        $filterBlock = $filters ? 'FILTER(' . implode(' && ', $filters) . ')' : '';

        return <<<SPARQL
PREFIX kawaland: <http://kawaland.org/ontology#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?product ?productName ?price ?category ?brand ?storeName ?storeLocation
WHERE {
  ?product a kawaland:Product ;
           kawaland:hasProductName ?productName ;
           kawaland:hasPrice ?price .

  OPTIONAL { ?product kawaland:hasCategory ?category }
  OPTIONAL { ?product kawaland:hasBrand ?brand }
  OPTIONAL { ?product kawaland:soldBy ?store }
  OPTIONAL { ?store kawaland:hasStoreName ?storeName }
  OPTIONAL { ?store kawaland:hasLocation ?storeLocation }

  $filterBlock
}
ORDER BY ?price
LIMIT 30
SPARQL;
    }

    /* ==========================================================
     |  CHATBOT RESPONSE
     ========================================================== */
    protected function buildReplyText(array $f, int $count): string
    {
        if ($count === 0) {
            return "😕 Produk tidak ditemukan, coba kata lain atau ubah budget.";
        }

        $parts = [];
        if ($f['q']) $parts[] = "\"{$f['q']}\"";
        if ($f['location']) $parts[] = "di {$f['location']}";
        if ($f['max_price']) $parts[] = "≤ Rp " . number_format($f['max_price'], 0, ',', '.');

        return "✅ Ditemukan {$count} produk " . implode(' ', $parts) . ".";
    }
}
