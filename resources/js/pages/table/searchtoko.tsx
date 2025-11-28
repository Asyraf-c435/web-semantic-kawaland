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
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const wordCount = query.trim().split(/\s+/).length;
  const isSmartMode = wordCount >= 3;



  // Live search with debounce
  useEffect(() => {
    if (!isSmartMode) {
      const delayDebounce = setTimeout(() => {
        fetchData(); // hanya jalan di live search
      }, 400);

      return () => clearTimeout(delayDebounce);
    }
  }, [query, page]);

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && isSmartMode) {
      fetchData(); // hanya NLP mode
    }
  };

  const fetchData = async () => {
    setLoading(true);

    // hitung jumlah kata
    const wordCount = query.trim().split(/\s+/).length;
    const smartMode = wordCount >= 3; // 3 kata → NLP otomatis

    try {
      const res = await axios.get("/semantic/search", {
        params: {
          q: query || undefined,
          smart: smartMode ? 1 : 0, // kirim ke backend
          page,
          per_page: 16,
        },
      });
      setResults(res.data.data || []);
    } catch (error) {
      console.error("Error fetching:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Head title="Cari Produk / Toko" />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">

          {/* Page Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl mb-5 shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Pencarian Produk & Toko
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Temukan produk impian Anda dengan pencarian semantik berdasarkan nama, kategori, toko, atau rentang harga
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full flex justify-center mb-12">
            <div className="relative w-full max-w-3xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 rounded-3xl blur-xl opacity-20"></div>
              <div className="relative backdrop-blur-xl bg-white rounded-3xl shadow-2xl border border-blue-100 p-2">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="w-full max-w-3xl px-4 py-2 border border-gray-300 rounded-lg shadow-sm
             focus:ring focus:ring-blue-300"
                  placeholder="Cari produk... (contoh: ember merah murah di batam)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                {isSmartMode && (
                  <div className="text-center text-blue-600 text-sm mt-2">
                    ⏳ Pencarian pintar siap — Tekan <b>ENTER</b> untuk menjalankan NLP 🔍
                  </div>
                )}

                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-blue-600 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* {query.trim().split(/\s+/).length >= 3 && (
            <div className="text-center text-blue-600 font-semibold mt-2">
              🔍 Pencarian Pintar (NLP) aktif – mencari berdasarkan warna, lokasi, dan harga...
            </div>
          )} */}


          {/* Loading Indicator */}
          {loading && (
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-4 px-8 py-4 bg-white backdrop-blur-lg rounded-2xl shadow-xl border border-blue-100">
                <div className="relative">
                  <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  <div className="absolute inset-0 animate-ping h-6 w-6 border-4 border-blue-300 border-t-transparent rounded-full opacity-20"></div>
                </div>
                <span className="text-gray-700 font-semibold">Mencari produk terbaik untuk Anda...</span>
              </div>
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <div>
              <div className="mb-8 flex items-center justify-between backdrop-blur-sm bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
                <p className="text-gray-700 font-semibold text-lg flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg text-white text-sm font-bold">
                    {results.length}
                  </span>
                  Produk ditemukan
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
                {results.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col group hover:-translate-y-3 border border-blue-100"
                  >
                    {item.image && (
                      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover group-hover:scale-125 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        {item.category && (
                          <div className="absolute top-4 right-4 backdrop-blur-md bg-white px-4 py-2 rounded-2xl text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg border border-blue-100">
                            {item.category}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-6 flex flex-col flex-1">
                      <div className="relative group/title mb-4 min-h-[3.5rem]">
                        <h2 className="font-bold text-lg line-clamp-2 text-gray-800 leading-tight">
                          {item.name}
                        </h2>
                        {/* Tooltip for full name on hover */}
                        <div className="absolute left-0 right-0 top-full mt-2 p-3 bg-gray-900 text-white text-sm rounded-xl shadow-2xl opacity-0 invisible group-hover/title:opacity-100 group-hover/title:visible transition-all duration-300 z-10 pointer-events-none">
                          <p className="break-words">{item.name}</p>
                          <div className="absolute -top-2 left-4 w-4 h-4 bg-gray-900 transform rotate-45"></div>
                        </div>
                      </div>

                      <div className="mb-5">
                        <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                          {item.price
                            ? new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              minimumFractionDigits: 0, // ⬅ Hilangkan angka ,00
                              maximumFractionDigits: 0,
                            }).format(item.price)
                            : "Hubungi Penjual"}
                        </p>
                      </div>

                      {item.store && (
                        <div className="flex items-center gap-3 mb-5 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-blue-100 shadow-sm">
                          {item.store.logo && (
                            <img
                              src={item.store.logo}
                              className="h-10 w-10 rounded-full object-cover border-3 border-white shadow-md ring-2 ring-blue-100"
                            />
                          )}
                          <div className="text-xs flex-1 min-w-0">
                            <div className="relative group/store">
                              <p className="font-bold text-gray-800 truncate">{item.store.name}</p>
                              {/* Tooltip for store name */}
                              <div className="absolute left-0 top-full mt-1 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/store:opacity-100 group-hover/store:visible transition-all duration-300 z-10 pointer-events-none whitespace-nowrap">
                                {item.store.name}
                              </div>
                            </div>
                            <div className="relative group/location mt-1">
                              <p className="text-gray-500 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">{item.store.location}</span>
                              </p>
                              {/* Tooltip for location */}
                              <div className="absolute left-0 top-full mt-1 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/location:opacity-100 group-hover/location:visible transition-all duration-300 z-10 pointer-events-none whitespace-nowrap">
                                {item.store.location}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-auto flex gap-3 pt-4">
                        <a
                          href={`/products/${item.id}`}
                          className="flex-1 text-center text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 py-3 rounded-2xl transition-all duration-300 hover:shadow-md border border-blue-100"
                        >
                          Detail
                        </a>
                        {item.productLink && (
                          <a
                            href={item.productLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 text-center text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-2xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            Beli
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center mt-20">
              <div className="inline-flex flex-col items-center gap-5 p-10 backdrop-blur-xl bg-white rounded-3xl shadow-2xl border border-blue-100 max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-inner">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-800 font-bold text-xl mb-2">Tidak ada hasil ditemukan</p>
                  <p className="text-gray-500">untuk pencarian "<span className="font-semibold text-blue-600">{query}</span>"</p>
                </div>
                <button
                  onClick={() => setQuery("")}
                  className="mt-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl hover:from-blue-700 hover:to-blue-900 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Hapus Pencarian
                </button>
              </div>
            </div>
          )}

          {!loading && !query && results.length === 0 && (
            <div className="text-center mt-20">
              <div className="inline-flex flex-col items-center gap-6 p-12 backdrop-blur-xl bg-white rounded-3xl shadow-2xl max-w-lg mx-auto border border-blue-100">
                <div className="relative w-28 h-28">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full opacity-20"></div>
                  <div className="relative w-28 h-28 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-inner">
                    <svg className="w-14 h-14 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-gray-800 font-bold text-2xl mb-3">Mulai Pencarian</p>
                  <p className="text-gray-500 text-base leading-relaxed">Ketik kata kunci di kolom pencarian untuk menemukan produk yang Anda cari</p>
                </div>
              </div>
            </div>
          )}
        </div>
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {/* Previous Button */}
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="group flex items-center justify-center w-11 h-11 rounded-xl bg-white border-2 border-blue-100 text-blue-600 font-bold transition-all duration-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-600 disabled:hover:border-blue-100 disabled:hover:shadow-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page Numbers */}
            {/* Page Numbers */}
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`
        relative w-11 h-11 rounded-xl font-bold transition-all duration-300
        ${page === pageNum
                      ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl scale-110 border-2 border-blue-500'
                      : 'bg-white border-2 border-blue-100 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg hover:scale-105'
                    }
      `}
                >
                  {page === pageNum && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl blur-lg opacity-50 -z-10"></div>
                  )}
                  {pageNum}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="group flex items-center justify-center w-11 h-11 rounded-xl bg-white border-2 border-blue-100 text-blue-600 font-bold transition-all duration-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-600 disabled:hover:border-blue-100 disabled:hover:shadow-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div >
        )
        }
      </main >

    </>
  );
}

// ➤ Gunakan AppLayout & breadcrumbs
SearchToko.layout = (page: React.ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);

export default SearchToko;