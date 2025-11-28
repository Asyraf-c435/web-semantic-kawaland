<?php

namespace App\Services\Semantic;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class FusekiService
{
    protected string $queryEndpoint;

    public function __construct()
    {
        $host = rtrim(config('services.fuseki.host'), '/');
        $dataset = trim(config('services.fuseki.dataset'), '/');

        $this->queryEndpoint = "{$host}/{$dataset}/query";
    }


   public function query(string $sparql): array
{
    try {
        Log::info("SPARQL Query Sent:", [$sparql]);
        Log::info("Endpoint URL:", [$this->queryEndpoint]);

        $response = Http::asForm()
            ->withHeaders([
                'Accept' => 'application/sparql-results+json',
            ])
            ->timeout(30)
            ->post($this->queryEndpoint, [
                'query' => $sparql   // ⬅ WAJIB! Format BENAR
            ]);

        Log::info("Fuseki Response Raw:", [$response->body()]);

        return $response->json()['results']['bindings'] ?? [];
    } catch (\Exception $e) {
        Log::error("Fuseki Query Error: " . $e->getMessage());
        return [];
    }
}
}