<?php
namespace App\Services\Semantic\Mappers;

class ProductMapper
{
   public static function fromBindings(array $bindings): array
{
    $products = [];

    foreach ($bindings as $row) {
        $productUri = $row['product']['value'] ?? null;
        if (!$productUri) continue;

        if (!isset($products[$productUri])) {
            $products[$productUri] = [
                "id"   => $productUri,
                "name" => $row['productName']['value'] ?? null,
                "price" => isset($row['price']['value']) ? (int)$row['price']['value'] : null,
                "image" => $row['image']['value'] ?? null,
                "category" => $row['category']['value'] ?? null,
                "brand" => $row['brand']['value'] ?? null,
                "description" => $row['description']['value'] ?? null,
                "productLink" => $row['productLink']['value'] ?? null,
                "rating" => $row['rating']['value'] ?? null,
                "stock" => isset($row['stock']['value']) ? (int)$row['stock']['value'] : null,
                "store" => [
                    "id" => $row['store']['value'] ?? null,
                    "name" => $row['storeName']['value'] ?? null,
                    "location" => $row['storeLocation']['value'] ?? null,
                    "logo" => $row['storeLogo']['value'] ?? null,
                ],
            ];
        }
    }

    return array_values($products);
}


    public static function singleOrNull(array $bindings): ?array
    {
        $list = self::fromBindings($bindings);
        return $list[0] ?? null;
    }
}
