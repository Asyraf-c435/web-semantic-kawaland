<?php

namespace App\Services\Semantic;

class NLPService
{
    public function parse(string $queryText): array
    {
        $text = strtolower($queryText);

        $filters = [
            'product'   => null,
            'category'  => null,
            'color'     => null,
            'location'  => null,
            'maxPrice'  => null,
            'keyword'   => $text,
        ];

        // 🔹 COLOR matching
        $colorKeywords = ['pink', 'biru', 'merah', 'hitam', 'putih', 'ungu', 'hijau', 'abu'];
        foreach ($colorKeywords as $color) {
            if (str_contains($text, $color)) {
                $filters['color'] = $color;
            }
        }

        // 🔹 LOCATION
        $locationKeywords = ['batam', 'tanjung pinang', 'tanjungpinang', 'bintan', 'kepri'];
        foreach ($locationKeywords as $loc) {
            if (str_contains($text, $loc)) {
                $filters['location'] = $loc;
            }
        }

        // 🔹 PRICE detection (regex)
        if (str_contains($text, 'murah')) {
            $filters['maxPrice'] = 50000;
        }

        if (preg_match('/(\d+)\s?(rb|ribu|k)/', $text, $matches)) {
            $filters['maxPrice'] = intval($matches[1]) * 1000;
        }

        if (preg_match('/di bawah (\d+)/', $text, $matches)) {
            $filters['maxPrice'] = intval($matches[1]);
        }

        // 🔹 Product synonyms
        $productSynonyms = [
            'ember portable' => ['ember portable', 'ember lipat', 'ember kain'],
            'ember'          => ['ember', 'baskom', 'lipat'],
            'foot spa'       => ['foot spa', 'spa kaki', 'rendam kaki', 'baskom rendam'],
        ];

        foreach ($productSynonyms as $standard => $synonyms) {
            foreach ($synonyms as $word) {
                if (str_contains($text, $word)) {
                    $filters['product'] = $standard;
                }
            }
        }

        return $filters;
    }
}
