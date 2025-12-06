'use client';

import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Pembelian', href: '/searchtoko' },
  { title: 'Toko', href: '/toko' },
];

function SearchToko() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0); // increment to trigger smart-mode search

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortPrice, setSortPrice] = useState("");
  const [sortDistance, setSortDistance] = useState("");
  const [sortRating, setSortRating] = useState("");

  // fix: when query is empty we want wordCount = 0
  const wordCount = query.trim() === "" ? 0 : query.trim().split(/\s+/).length;
  const isSmartMode = wordCount >= 3;

  // Debounce query for non-smart mode
  useEffect(() => {
    if (!isSmartMode) {
      const t = setTimeout(() => setDebouncedQuery(query.trim()), 400);
      return () => clearTimeout(t);
    }
    // entering smart mode - clear debouncedQuery so it's not accidentally used
    setDebouncedQuery("");
  }, [query, isSmartMode]);

  // Core fetch effect:
  // - for non-smart mode: runs when debouncedQuery, page, or sorts change
  // - for smart mode: only runs when user triggers search (searchTrigger > 0), or when page/sorts change after a trigger
  useEffect(() => {
    // For smart mode, require an explicit trigger (Enter)
    if (isSmartMode && searchTrigger === 0) return;

    const q = isSmartMode ? query.trim() : debouncedQuery;

    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/semantic/search", {
          params: {
            q: q || undefined,
            smart: isSmartMode ? 1 : 0,
            sort_price: sortPrice || undefined,
            sort_distance: sortDistance || undefined,
            sort_rating: sortRating || undefined,
            page,
            per_page: 16,
          },
          signal: controller.signal,
        });

        setResults(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err: any) {
        // axios request aborted -> ignore
        if (err?.name === "CanceledError" || err?.message === "canceled") {
          // cancelled
        } else {
          console.error("Error fetching:", err);
          setResults([]);
          setTotalPages(1);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, page, sortPrice, sortDistance, sortRating, searchTrigger, isSmartMode]);

  // Smart-mode: Enter triggers a search
  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && isSmartMode) {
      setPage(1);
      setSearchTrigger((s) => s + 1);
    }
  };

  const handleSortChange = (type: 'price' | 'distance' | 'rating', value: string) => {
    setPage(1);
    if (type === 'price') setSortPrice(value);
    else if (type === 'distance') setSortDistance(value);
    else if (type === 'rating') setSortRating(value);

    // If in smart-mode, user changed sort -> force search (increment trigger)
    if (isSmartMode) setSearchTrigger((s) => s + 1);
  };

  const resetFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setSortPrice("");
    setSortDistance("");
    setSortRating("");
    setPage(1);
    setSearchTrigger(0);
  };

  return (
    <>
      <Head title="Cari Produk / Toko" />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">

            {/* Page Header */}
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl mb-6 shadow-2xl transform hover:rotate-6 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                Temukan Produk Impian
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                Pencarian semantik dengan filter cerdas untuk pengalaman belanja terbaik
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-4xl mx-auto mb-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                  <div className="flex items-center p-2">
                    <div className="pl-4 flex items-center pointer-events-none">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="flex-1 px-4 py-4 bg-transparent border-none outline-none text-gray-800 text-lg placeholder-gray-400 focus:placeholder-gray-300"
                      placeholder="Cari produk... (contoh: laptop gaming murah)"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        className="mr-2 p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-10 justify-center items-center">
              <div className="relative group">
                <select
                  value={sortPrice}
                  onChange={(e) => handleSortChange('price', e.target.value)}
                  className="appearance-none px-6 py-3.5 pr-12 rounded-xl border-2 border-blue-200 bg-white shadow-sm hover:shadow-md hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium text-gray-700 cursor-pointer outline-none"
                >
                  <option value="">Harga</option>
                  <option value="lowest">Termurah</option>
                  <option value="highest">Termahal</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500 group-hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative group">
                <select
                  value={sortDistance}
                  onChange={(e) => handleSortChange('distance', e.target.value)}
                  className="appearance-none px-6 py-3.5 pr-12 rounded-xl border-2 border-indigo-200 bg-white shadow-sm hover:shadow-md hover:border-indigo-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 font-medium text-gray-700 cursor-pointer outline-none"
                >
                  <option value="">Jarak</option>
                  <option value="nearest">Terdekat</option>
                  <option value="farthest">Terjauh</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500 group-hover:text-indigo-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative group">
                <select
                  value={sortRating}
                  onChange={(e) => handleSortChange('rating', e.target.value)}
                  className="appearance-none px-6 py-3.5 pr-12 rounded-xl border-2 border-amber-200 bg-white shadow-sm hover:shadow-md hover:border-amber-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all duration-300 font-medium text-gray-700 cursor-pointer outline-none"
                >
                  <option value="">⭐ Rating</option>
                  <option value="highest">Terbaik</option>
                  <option value="lowest">Terendah</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500 group-hover:text-amber-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {(sortPrice || sortDistance || sortRating) && (
                <button
                  onClick={resetFilters}
                  className="group px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow-sm hover:shadow-md hover:from-red-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filter
                </button>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex justify-center mb-10">
                <div className="inline-flex items-center gap-4 px-8 py-5 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-100">
                  <div className="relative">
                    <div className="animate-spin h-7 w-7 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    <div className="absolute inset-0 animate-ping h-7 w-7 border-4 border-blue-300 border-t-transparent rounded-full opacity-20"></div>
                  </div>
                  <span className="text-gray-700 font-bold text-lg">Mencari produk terbaik...</span>
                </div>
              </div>
            )}

            {/* Results Header */}
            {!loading && results.length > 0 && (
              <>
                <div className="mb-8 backdrop-blur-xl bg-white/80 rounded-3xl p-5 shadow-xl border border-white/50">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white text-xl font-black shadow-lg">
                        {results.length}
                      </div>
                      <div>
                        <p className="text-gray-800 font-bold text-lg">Produk Ditemukan</p>
                        <p className="text-gray-500 text-sm">Halaman {page} dari {totalPages}</p>
                      </div>
                    </div>
                    {query && (
                      <div className="px-5 py-2 bg-blue-100 rounded-2xl">
                        <p className="text-blue-800 font-semibold text-sm">
                          Hasil pencarian: <span className="font-black">"{query}"</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {results.map((item) => (
                    <div
                      key={item.id}
                      className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/50 hover:-translate-y-2"
                    >
                      {/* Product Image */}
                      {item.image && (
                        <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          {/* Category Badge */}
                          {item.category && (
                            <div className="absolute top-3 right-3 backdrop-blur-md bg-white/90 px-4 py-1.5 rounded-xl text-xs font-bold text-blue-700 shadow-lg border border-blue-100">
                              {item.category}
                            </div>
                          )}

                          {/* Stock Badge */}
                          {item.stock !== null && (
                            <div className={`absolute top-3 left-3 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg ${
                              item.stock > 0 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                              {item.stock > 0 ? `📦 Stok: ${item.stock}` : '❌ Habis'}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="p-5 flex flex-col">
                        {/* Product Name */}
                        <h2 className="font-bold text-lg line-clamp-2 text-gray-800 mb-3 min-h-[3.5rem] leading-snug group-hover:text-blue-700 transition-colors">
                          {item.name}
                        </h2>

                        {/* Price */}
                        <div className="mb-4">
                          <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                            {item.price
                              ? new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                  minimumFractionDigits: 0,
                                }).format(item.price)
                              : "Hubungi Penjual"}
                          </p>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                            <p className="text-xs text-gray-600 mb-1">📍 Jarak</p>
                            <p className="font-black text-blue-700 text-sm">{item.distance?.toFixed(1) || 0} km</p>
                          </div>
                          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-xl border border-amber-200">
                            <p className="text-xs text-gray-600 mb-1">⭐ Rating</p>
                            <p className="font-black text-amber-700 text-sm">{item.rating || 0} / 5</p>
                          </div>
                        </div>

                        {/* Store Info */}
                        {item.store && (
                          <div className="flex items-center gap-3 mb-5 p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 shadow-sm">
                            {item.store.logo && (
                              <img
                                src={item.store.logo}
                                alt={item.store.name}
                                className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-blue-100"
                              />
                            )}
                            <div className="text-xs flex-1 min-w-0">
                              <p className="font-bold text-gray-800 truncate mb-1">{item.store.name}</p>
                              <p className="text-gray-500 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                <span className="truncate">{item.store.location}</span>
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-auto">
                          <a
                            href={`/products/${item.id}`}
                            className="flex-1 text-center text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 py-3 rounded-2xl transition-all duration-300 hover:shadow-md border-2 border-blue-200 hover:border-blue-300"
                          >
                            📄 Detail
                          </a>
                          {item.productLink && (
                            <a
                              href={item.productLink}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 text-center text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                              🛒 Beli
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* No Results */}
            {!loading && query && results.length === 0 && (
              <div className="text-center mt-20">
                <div className="inline-flex flex-col items-center gap-6 p-12 backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/50 max-w-md">
                  <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center shadow-inner">
                    <svg className="w-14 h-14 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-800 font-black text-2xl mb-3">Tidak Ada Hasil</p>
                    <p className="text-gray-600 mb-2">untuk pencarian</p>
                    <p className="text-blue-700 font-bold text-lg">"{query}"</p>
                  </div>
                  <button
                    onClick={resetFilters}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    🔄 Reset Pencarian
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !query && results.length === 0 && (
              <div className="text-center mt-20">
                <div className="inline-flex flex-col items-center gap-8 p-14 backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl max-w-lg border border-white/50">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full opacity-20 animate-pulse"></div>
                    <div className="relative w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center shadow-inner">
                      <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-800 font-black text-3xl mb-4">Mulai Pencarian Anda</p>
                    <p className="text-gray-600 text-base leading-relaxed max-w-sm">
                      Ketik kata kunci di kolom pencarian untuk menemukan produk yang Anda inginkan
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-blue-200 text-blue-600 font-bold transition-all duration-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-xl hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (page <= 4) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = page - 3 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-12 h-12 rounded-2xl font-bold transition-all duration-300 ${
                          page === pageNum
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl scale-110 border-2 border-blue-500'
                            : 'bg-white/80 backdrop-blur-sm border-2 border-blue-200 text-gray-700 hover:bg-blue-50 hover:border-blue-400 hover:scale-105'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-blue-200 text-blue-600 font-bold transition-all duration-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-xl hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

SearchToko.layout = (page: React.ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);

export default SearchToko;
