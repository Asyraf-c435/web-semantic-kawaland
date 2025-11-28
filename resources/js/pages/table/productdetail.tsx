'use client';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import axios from 'axios';

// Leaflet
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icon default Leaflet (supaya icon marker muncul)
const DefaultIcon = L.icon({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Pembelian', href: '/dashboard-purchasing' },
  { title: 'Toko', href: '/toko' },
  { title: 'Detail Produk', href: '#' },
];

type Product = {
  id: string | null;
  name: string | null;
  price: number | null;
  image?: string | null;
  category?: string | null;
  brand?: string | null;
  condition?: string | null;
  description?: string | null;
  productLink?: string | null;
  rating?: string | null;
  reviewCount?: number | null;
  stock?: number | null;
  store?: {
    name?: string | null;
    location?: string | null;
    logo?: string | null;
  };
};

type LocationInfo = {
  latitude: number;
  longitude: number;
  distance_km: number;
  status: 'Dekat' | 'Jauh' | string;
  user_lat: number;
  user_lng: number;
  base_lat: number;
  base_lng: number;
};

function ProductDetailPage() {
  const page = usePage<{ id: string }>();
  const { id } = page.props;

  const [product, setProduct] = useState<Product | null>(null);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`/semantic/products/${id}`);
        if (res.data?.success) {
          setProduct(res.data.data);
          setLocation(res.data.location);
        }
      } catch (error) {
        console.error('Error fetching product detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <>
        <Head title="Detail Produk" />
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes glow {
            0%, 100% { opacity: 0.3; filter: blur(20px); }
            50% { opacity: 0.5; filter: blur(30px); }
          }
          .float-animation {
            animation: float 6s ease-in-out infinite;
          }
          .glow-orb {
            animation: glow 4s ease-in-out infinite;
          }
        `}</style>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
          {/* Floating Light Orbs Background */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full glow-orb"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-300 rounded-full glow-orb" style={{animationDelay: '2s'}}></div>
          
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-white backdrop-blur-lg rounded-2xl shadow-xl border border-blue-100 relative z-10">
            <div className="relative">
              <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <div className="absolute inset-0 animate-ping h-6 w-6 border-4 border-blue-300 border-t-transparent rounded-full opacity-20"></div>
            </div>
            <span className="text-gray-700 font-semibold">Memuat detail produk...</span>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Head title="Detail Produk" />
        <style>{`
          @keyframes glow {
            0%, 100% { opacity: 0.3; filter: blur(20px); }
            50% { opacity: 0.5; filter: blur(30px); }
          }
          .glow-orb {
            animation: glow 4s ease-in-out infinite;
          }
        `}</style>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full glow-orb"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-300 rounded-full glow-orb" style={{animationDelay: '2s'}}></div>
          
          <div className="backdrop-blur-xl bg-white rounded-3xl shadow-2xl border border-blue-100 p-10 relative z-10">
            <p className="text-red-600 font-semibold text-lg">Produk tidak ditemukan.</p>
          </div>
        </div>
      </>
    );
  }

  const priceFormatted =
    product.price != null
      ? new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(product.price)
      : '-';

  const imgSrc =
    product.image && product.image.startsWith('data:image')
      ? product.image
      : product.image
      ? `data:image/jpeg;base64,${product.image}`
      : null;

  return (
    <>
      <Head title={`Detail Produk - ${product.name || ''}`} />
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.3; filter: blur(20px); }
          50% { opacity: 0.5; filter: blur(30px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
        .glow-orb {
          animation: glow 4s ease-in-out infinite;
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 md:p-8 relative overflow-hidden">
        {/* Floating Light Orbs Background */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full glow-orb"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-300 rounded-full glow-orb" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-blue-300 rounded-full glow-orb" style={{animationDelay: '1s'}}></div>
        
        <div className="max-w-6xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 p-6 md:p-10 relative z-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Gambar */}
            <div className="lg:w-2/5 flex items-start justify-center">
              <div className="relative w-full">
                {imgSrc ? (
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-50 to-blue-50 group">
                    <img
                      src={imgSrc}
                      alt={product.name || ''}
                      className="rounded-3xl w-full h-auto object-contain max-h-96 transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    {/* Small glow effect */}
                    <div className="absolute top-4 left-4 w-4 h-4 bg-blue-400 rounded-full blur-sm opacity-60 animate-pulse"></div>
                    <div className="absolute bottom-4 right-4 w-3 h-3 bg-cyan-400 rounded-full blur-sm opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
                  </div>
                ) : (
                  <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl text-gray-400 shadow-inner">
                    <div className="text-center">
                      <svg className="w-20 h-20 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">Tidak ada gambar</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info Utama */}
            <div className="lg:w-3/5 flex flex-col gap-4">
              <div className="relative">
                <h1 className="text-4xl font-extrabold text-gray-800 leading-tight mb-2">
                  {product.name || 'Tanpa nama'}
                </h1>
                <div className="absolute -left-3 top-2 w-2 h-2 bg-blue-400 rounded-full blur-sm opacity-60 animate-pulse"></div>
              </div>

              <div className="relative inline-block">
                <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {priceFormatted}
                </p>
                <div className="absolute -left-2 bottom-2 w-3 h-3 bg-blue-400 rounded-full blur-sm opacity-60 animate-pulse"></div>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {product.category && (
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-2xl text-sm font-bold border border-blue-100 shadow-sm">
                    Kategori: {product.category}
                  </span>
                )}
                {product.brand && (
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-2xl text-sm font-bold border border-purple-100 shadow-sm">
                    Brand: {product.brand}
                  </span>
                )}
                {product.condition && (
                  <span className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-2xl text-sm font-bold border border-emerald-100 shadow-sm">
                    Kondisi: {product.condition}
                  </span>
                )}
                {product.stock != null && (
                  <span className="px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 rounded-2xl text-sm font-bold border border-orange-100 shadow-sm">
                    Stok: {product.stock}
                  </span>
                )}
              </div>

              {product.rating && (
                <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-100 shadow-sm">
                  <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-bold text-gray-800 text-lg">{product.rating}</span>
                  {product.reviewCount != null && (
                    <span className="text-gray-600 text-sm">({product.reviewCount} ulasan)</span>
                  )}
                </div>
              )}

              {/* Toko */}
              {product.store && (
                <div className="mt-4 flex items-center gap-4 p-5 bg-gradient-to-br from-white to-blue-50 rounded-3xl border border-blue-100 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400 rounded-full blur-3xl opacity-10"></div>
                  
                  {product.store.logo && (
                    <img
                      src={product.store.logo}
                      alt={product.store.name || ''}
                      className="h-16 w-16 rounded-full object-cover border-3 border-white shadow-lg ring-2 ring-blue-100 relative z-10"
                    />
                  )}
                  <div className="relative z-10 flex-1">
                    <p className="font-bold text-lg text-gray-800">
                      {product.store.name}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {product.store.location || 'Lokasi tidak diketahui'}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-4">
                {product.productLink && (
                  <a
                    href={product.productLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 min-w-[200px] text-center px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-400/50 hover:scale-105 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Kunjungi Toko
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </a>
                )}
                <a
                  href="/toko"
                  className="flex-1 min-w-[200px] text-center px-6 py-4 rounded-2xl border-2 border-blue-200 text-blue-700 font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Kembali
                </a>
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          {product.description && (
            <div className="mt-10 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl border border-blue-100 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400 rounded-full blur-3xl opacity-10"></div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-3 relative z-10">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Deskripsi Produk
              </h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed relative z-10">
                {product.description}
              </p>
            </div>
          )}

          {/* Map & Info Jarak */}
          {location && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-3">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Lokasi Toko
              </h2>
              
              <div className="mb-4 p-5 bg-gradient-to-r from-white to-blue-50 rounded-2xl border border-blue-100 shadow-md">
                <p className="text-gray-700 font-medium flex items-center gap-2">
                  <span>Status jarak:</span>
                  <span
                    className={`px-4 py-1 rounded-full font-bold text-sm ${
                      location.status === 'Dekat'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}
                  >
                    {location.status}
                  </span>
                  <span className="text-blue-600 font-bold">({location.distance_km} km dari titik referensi)</span>
                </p>
              </div>

              <div className="w-full h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-100 relative">
                <div className="absolute top-4 left-4 w-3 h-3 bg-blue-400 rounded-full blur-sm opacity-60 animate-pulse z-[1000]"></div>
                <div className="absolute bottom-4 right-4 w-2 h-2 bg-cyan-400 rounded-full blur-sm opacity-60 animate-pulse z-[1000]"></div>
                <MapContainer
                  center={[location.latitude, location.longitude]}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[location.latitude, location.longitude]}>
                    <Popup>
                      <div className="text-xs p-2">
                        <p className="font-bold mb-2 text-base text-blue-700">
                          {product.store?.name || 'Toko'}
                        </p>
                        <p className="text-gray-600 mb-1">
                          Koordinat: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                        </p>
                        <p className="text-gray-600">
                          Jarak: <span className="font-semibold text-blue-600">{location.distance_km} km</span> ({location.status})
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

ProductDetailPage.layout = (page: React.ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);

export default ProductDetailPage;