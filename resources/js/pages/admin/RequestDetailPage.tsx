// 'use client';

// <<<<<<< HEAD
// import { useState, useEffect } from "react";
// import Sidebar from "../../components/admin/dashboard/Sidebar";
// import Header from "../../components/admin/dashboard/Header";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   Cell,
// } from "recharts";
// import {
//   CheckCircle,
//   Clock,
//   XCircle,
//   ClipboardList,
//   Wallet,
//   ArrowLeft,
//   ShoppingBag,
//   Truck,
//   Edit2,
// } from "lucide-react";
// import { Link, usePage } from "@inertiajs/react";

// // Format Rupiah
// const formatRupiah = (angka: number) => "Rp" + angka.toLocaleString("id-ID");

// // Tooltip untuk BarChart
// =======
// import { Link, usePage } from '@inertiajs/react';
// import { useState } from 'react';

// import Header from '../../components/admin/dashboard/Header';
// import Sidebar from '../../components/admin/dashboard/Sidebar';

// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';

// import { ArrowLeft, ClipboardList, ShoppingBag, Truck } from 'lucide-react';

// // Tooltip Chart
// >>>>>>> 4320a06f3f92fff7eae9d0f284321a5750263389
// const CustomTooltip = ({ active, payload }: any) => {
//     if (active && payload && payload.length) {
//         const { day, date } = payload[0].payload;
//         return (
//             <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
//                 <p className="font-medium text-slate-700">{`${day}, ${date}`}</p>
//                 <p className="font-semibold text-[#3b82a0]">
//                     {payload[0].value} Request
//                 </p>
//             </div>
//         );
//     }
//     return null;
// };

// interface RequestItem {
//   id: number;
//   request_id: number;
//   nama_barang: string;
//   jumlah_diajukan: number;
//   jumlah_disetujui: number;
//   status: string;
//   satuan: string;
//   departemen: string;
//   catatan: string;
//   created_at: string;
// }

// interface DepartmentData {
//   request_number: string;
//   status: string;
//   request_date: string;
//   totalItems: number;
//   totalCost: number;
//   completed: number;
//   pending: number;
//   items: RequestItem[];
//   chartData: Array<{
//     day: string;
//     date: string;
//     total: number;
//   }>;
// }

// // Fix: Tambahkan index signature untuk PageProps
// interface PageProps {
//   kode_department: string;
//   [key: string]: any; // Index signature
// }

// export default function RequestDetailPage() {
// <<<<<<< HEAD
//   const { props } = usePage<PageProps>();
//   const { kode_department } = props;
  
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [requestSearch, setRequestSearch] = useState("");
//   const [purchaseSearch, setPurchaseSearch] = useState("");
//   const [departmentData, setDepartmentData] = useState<DepartmentData | null>(null);
//   const [loading, setLoading] = useState(true);

//   const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

//   useEffect(() => {
//     const fetchDepartmentData = async () => {
//       try {
//         const response = await fetch(`/api/requests-by-department/${kode_department}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch department data');
//         }
//         const data = await response.json();
//         setDepartmentData(data);
//       } catch (error) {
//         console.error('Error fetching department data:', error);
//         setDepartmentData(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (kode_department) {
//       fetchDepartmentData();
//     } else {
//       setLoading(false);
//     }
//   }, [kode_department]);

//   if (loading) {
//     return (
//       <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4789A8] mx-auto"></div>
//             <p className="mt-4 text-gray-600">Memuat data departemen...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!departmentData || !kode_department) {
//     return (
//       <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <p className="text-red-600">Gagal memuat data departemen atau kode department tidak valid</p>
//             <Link href="/admin/requestitem">
//               <Button className="mt-4 bg-[#4789A8] hover:bg-[#356b87] text-white">
//                 Kembali ke Request Item
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const filteredRequests = departmentData.items.filter(
//     (r) =>
//       r.nama_barang.toLowerCase().includes(requestSearch.toLowerCase()) ||
//       r.status.toLowerCase().includes(requestSearch.toLowerCase())
//   );

//   // Data untuk riwayat barang masuk (completed/arrived items)
//   const incomingItems = departmentData.items
//     .filter(item => item.status === 'Completed' || item.status === 'Arrived')
//     .map((item, index) => ({
//       id: index + 1,
//       item: item.nama_barang,
//       tgl: new Date(item.created_at).toLocaleDateString('id-ID', { 
//         day: '2-digit', 
//         month: 'short', 
//         year: 'numeric' 
//       }),
//       jml: item.jumlah_disetujui || item.jumlah_diajukan,
//       sat: item.satuan,
//       harga: formatRupiah(0),
//       total: formatRupiah(0),
//     }));

//   const filteredPurchases = incomingItems.filter(
//     (p) =>
//       p.item.toLowerCase().includes(purchaseSearch.toLowerCase())
//   );

//   return (
//     <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
//       {/* Sidebar */}
//       <div
//         className={`fixed top-0 left-0 h-full w-[260px] bg-white shadow-md transition-transform duration-300 ${
//           isSidebarOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         <Sidebar />
//       </div>

//       {/* Main content */}
//       <div
//         className={`flex flex-col flex-1 transition-all duration-300 ${
//           isSidebarOpen ? "ml-[260px]" : "ml-0"
//         }`}
//       >
//         {/* Header */}
//         <div
//           className={`fixed top-0 right-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] z-200 transition-all duration-300 ${
//             isSidebarOpen ? "left-[260px]" : "left-0"
//           }`}
//         >
//           <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
//         </div>

//         {/* Page content */}
//         <div className="flex flex-col gap-8 px-10 py-24 transition-all duration-300">
//           {/* Page Header */}
//           <div className="w-full rounded-xl bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
//             <div className="max-w-7xl mx-auto flex justify-between items-center px-10 py-5">
//               <div className="flex items-center gap-3">
//                 <div className="bg-[#4789A8]/10 p-3 rounded-xl">
//                   <ClipboardList className="w-6 h-6 text-[#4789A8]" />
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-800">
//                     {departmentData.items[0]?.departemen || 'Department'}
//                   </h1>
//                   <p className="text-gray-500 text-sm">Detail aktivitas permintaan barang</p>
//                   <p className="text-gray-400 text-xs">Kode: {kode_department}</p>
//                 </div>
//               </div>

//               <Link href="/admin/requestitem">
//                 <Button
//                   variant="outline"
//                   className="flex items-center gap-2 border border-[#4789A8] text-[#4789A8] hover:bg-[#4789A8] hover:text-white transition-all"
//                 >
//                   <ArrowLeft className="w-4 h-4" />
//                   Kembali
//                 </Button>
//               </Link>
//             </div>
//           </div>

//           {/* Stats + Chart */}
//           <div className="flex flex-col gap-6">
//             {/* Stats bar di atas */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               {/* Total Cost */}
//               <Card className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-500">Total Cost</p>
//                     <p className="text-2xl font-bold text-gray-900 mt-1">
//                       {formatRupiah(departmentData.totalCost)}
//                     </p>
//                   </div>
//                   <Wallet className="w-6 h-6 text-blue-500" />
//                 </div>
//                 <p className="text-xs text-blue-500 mt-2">Total biaya permintaan</p>
//               </Card>

//               {/* Total Order */}
//               <Card className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-500">Total Order</p>
//                     <p className="text-2xl font-bold text-gray-900 mt-1">
//                       {departmentData.totalItems}
//                     </p>
//                   </div>
//                   <ClipboardList className="w-6 h-6 text-green-500" />
//                 </div>
//                 <p className="text-xs text-green-500 mt-2">Total item yang diminta</p>
//               </Card>

//               {/* Completed */}
//               <Card className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-500">Completed</p>
//                     <p className="text-2xl font-bold text-gray-900 mt-1">
//                       {departmentData.completed}
//                     </p>
//                   </div>
//                   <CheckCircle className="w-6 h-6 text-green-500" />
//                 </div>
//                 <p className="text-xs text-green-500 mt-2">Item yang sudah selesai</p>
//               </Card>

//               {/* Pending */}
//               <Card className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-500">Pending</p>
//                     <p className="text-2xl font-bold text-gray-900 mt-1">
//                       {departmentData.pending}
//                     </p>
//                   </div>
//                   <Clock className="w-6 h-6 text-yellow-500" />
//                 </div>
//                 <p className="text-xs text-yellow-500 mt-2">Item dalam proses</p>
//               </Card>
//             </div>

//             {/* Chart di bawah */}
//             <Card className="p-6 [bg-gradient-to-br] from-white to-[#f0f8fa] rounded-2xl shadow-sm border border-slate-200">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold text-slate-800">
//                   Aktivitas Permintaan Mingguan
//                 </h2>
//                 <p className="text-sm text-slate-500">7 Hari Terakhir</p>
//               </div>

//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart
//                   data={departmentData.chartData}
//                   margin={{ top: 20, right: 20, left: 0, bottom: 30 }}
//                 >
//                   <defs>
//                     <linearGradient id="barDefault" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="0%" stopColor="#b8e0ed" stopOpacity={0.95} />
//                       <stop offset="100%" stopColor="#84c3d7" stopOpacity={0.95} />
//                     </linearGradient>
//                   </defs>

//                   <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                   <XAxis
//                     dataKey="day"
//                     axisLine={false}
//                     tickLine={false}
//                     tick={({ x, y, payload }) => {
//                       const dayData = departmentData.chartData.find((d) => d.day === payload.value);
//                       return (
//                         <g transform={`translate(${x},${y + 10})`}>
//                           <text
//                             x={0}
//                             y={0}
//                             dy={10}
//                             textAnchor="middle"
//                             className="fill-slate-700 text-[12px] font-medium"
//                           >
//                             {dayData?.day}
//                           </text>
//                           <text
//                             x={0}
//                             y={0}
//                             dy={22}
//                             textAnchor="middle"
//                             className="fill-slate-400 text-[11px]"
//                           >
//                             {dayData?.date}
//                           </text>
//                         </g>
//                       );
//                     }}
//                   />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fill: "#94a3b8", fontSize: 12 }}
//                   />
//                   <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />

//                   <Bar dataKey="total" radius={[12, 12, 0, 0]} barSize={50}>
//                     {departmentData.chartData.map((_, index) => (
//                       <Cell key={`cell-${index}`} fill="url(#barDefault)" />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </Card>
//           </div>

//           {/* Request Table */}
//           <Card className="p-4 shadow-md border border-slate-200 rounded-2xl flex flex-col h-[400px] bg-white mt-4">
//             {/* Header */}
//             <div className="flex justify-between items-center mb-3">
//               <h3 className="font-bold text-slate-800 flex items-center gap-2">
//                 <ShoppingBag className="w-5 h-5 text-[#4789A8]" />
//                 Daftar Request Item
//               </h3>
//               <input
//                 type="text"
//                 placeholder="Cari item..."
//                 value={requestSearch}
//                 onChange={(e) => setRequestSearch(e.target.value)}
//                 className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#4789A8]"
//               />
//             </div>

//             {/* Table */}
//             <div className="overflow-y-auto flex-1 rounded-xl max-h-[280px]">
//               <table className="w-full text-sm text-center border-collapse">
//                 <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10">
//                   <tr>
//                     <th className="py-3 px-4">No</th>
//                     <th className="py-3 px-4 text-left">Item</th>
//                     <th className="py-3 px-4">Tanggal</th>
//                     <th className="py-3 px-4">Jumlah Diajukan</th>
//                     <th className="py-3 px-4">Jumlah Disetujui</th>
//                     <th className="py-3 px-4">Satuan</th>
//                     <th className="py-3 px-4">Status</th>
//                     <th className="py-3 px-4">Aksi</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredRequests.map((item, i) => (
//                     <tr
//                       key={item.id}
//                       className={`${
//                         i % 2 === 0 ? "bg-white" : "bg-slate-50"
//                       } hover:bg-slate-100 transition-colors`}
//                     >
//                       <td className="py-3 px-4 font-medium">{i + 1}</td>
//                       <td className="py-3 px-4 text-left font-semibold text-slate-700">
//                         {item.nama_barang}
//                       </td>
//                       <td className="py-3 px-4 text-slate-700">
//                         {new Date(item.created_at).toLocaleDateString('id-ID')}
//                       </td>
//                       <td className="py-3 px-4 text-slate-700">{item.jumlah_diajukan}</td>
//                       <td className="py-3 px-4 text-slate-700">
//                         {item.jumlah_disetujui || 0}
//                       </td>
//                       <td className="py-3 px-4 text-slate-700">{item.satuan}</td>
//                       <td
//                         className={`py-3 px-4 font-semibold ${
//                           item.status === 'Completed' || item.status === 'Arrived'
//                             ? "text-green-600"
//                             : item.status === 'Pending'
//                             ? "text-yellow-600"
//                             : item.status === 'Rejected'
//                             ? "text-red-600"
//                             : "text-blue-600"
//                         }`}
//                       >
//                         {item.status}
//                       </td>
//                       <td className="py-3 px-4 flex justify-center">
//                         <Button
//                           size="sm"
//                           className="flex items-center gap-1 bg-[#4789A8] text-white hover:bg-[#356b87]"
//                         >
//                           <Edit2 className="w-4 h-4" /> Edit
//                         </Button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <p className="text-xs text-slate-500 mt-2 italic text-left">
//               Menampilkan {filteredRequests.length} dari {departmentData.items.length} request item.
//             </p>
//           </Card>

//           {/* Riwayat Barang Masuk */}
//           <Card className="p-4 shadow-md border border-slate-200 rounded-2xl flex flex-col h-[400px] bg-white mt-4">
//             <div className="flex justify-between items-center mb-3">
//               <h3 className="font-bold text-slate-800 flex items-center gap-2">
//                 <Truck className="w-5 h-5 text-[#4789A8]" />
//                 Riwayat Barang Masuk
//               </h3>

//               <input
//                 type="text"
//                 placeholder="Cari barang..."
//                 value={purchaseSearch}
//                 onChange={(e) => setPurchaseSearch(e.target.value)}
//                 className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#4789A8]"
//               />
//             </div>

//             <div className="overflow-y-auto flex-1 rounded-xl max-h-[280px]">
//               <table className="w-full text-sm text-center border-collapse">
//                 <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10">
//                   <tr>
//                     <th className="py-3 px-4 text-left">Nama Item</th>
//                     <th className="py-3 px-4 text-left">Tanggal Masuk</th>
//                     <th className="py-3 px-4 text-left">Jumlah</th>
//                     <th className="py-3 px-4 text-left">Satuan</th>
//                     <th className="py-3 px-4 text-left">Status</th>
//                     <th className="py-3 px-4">Aksi</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredPurchases.map((purchase, i) => (
//                     <tr
//                       key={purchase.id}
//                       className={`${
//                         i % 2 === 0 ? "bg-white" : "bg-slate-50"
//                       } hover:bg-slate-100 transition-colors`}
//                     >
//                       <td className="py-3 px-4 text-left font-medium text-slate-700">
//                         {purchase.item}
//                       </td>
//                       <td className="py-3 px-4 text-left text-slate-700">{purchase.tgl}</td>
//                       <td className="py-3 px-4 text-left text-slate-700">{purchase.jml}</td>
//                       <td className="py-3 px-4 text-left text-slate-700">{purchase.sat}</td>
//                       <td className="py-3 px-4 text-left">
//                         <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
//                           Selesai
//                         </span>
//                       </td>
//                       <td className="py-3 px-4 flex justify-center">
//                         <Button
//                           size="sm"
//                           className="flex items-center gap-1 bg-[#4789A8] text-white hover:bg-[#356b87]"
//                         >
//                           <Edit2 className="w-4 h-4" /> Detail
//                         </Button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <p className="text-xs text-slate-500 mt-2 italic text-left">
//               Daftar barang yang sudah masuk dan disetujui.
//             </p>
//           </Card>
// =======
//     // Ambil data dari Laravel
//     const { stats, chart, requests, history, deptName } = usePage()
//         .props as any;

//     const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//     const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

//     return (
//         <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
//             {/* Sidebar */}
//             <div
//                 className={`fixed top-0 left-0 h-full w-[260px] bg-white shadow-md transition-transform duration-300 ${
//                     isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
//                 }`}
//             >
//                 <Sidebar />
//             </div>

//             {/* Main content */}
//             <div
//                 className={`flex flex-1 flex-col transition-all duration-300 ${
//                     isSidebarOpen ? 'ml-[260px]' : 'ml-0'
//                 }`}
//             >
//                 {/* Header */}
//                 <div
//                     className={`fixed top-0 right-0 z-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-300 ${
//                         isSidebarOpen ? 'left-[260px]' : 'left-0'
//                     }`}
//                 >
//                     <Header
//                         isSidebarOpen={isSidebarOpen}
//                         onToggleSidebar={toggleSidebar}
//                     />
//                 </div>

//                 {/* Page content */}
//                 <div className="flex flex-col gap-8 px-10 py-24 transition-all duration-300">
//                     {/* Page Header */}
//                     <div className="sticky top-0 z-40 w-full rounded-xl border-b border-slate-200 bg-white shadow-sm">
//                         <div className="mx-auto flex max-w-7xl items-center justify-between px-10 py-5">
//                             <div className="flex items-center gap-3">
//                                 <div className="rounded-xl bg-[#4789A8]/10 p-3">
//                                     <ClipboardList className="h-6 w-6 text-[#4789A8]" />
//                                 </div>
//                                 <div>
//                                     <h1 className="text-2xl font-bold text-gray-800">
//                                         {deptName}
//                                     </h1>
//                                     <p className="text-sm text-gray-500">
//                                         Detail aktivitas permintaan barang
//                                     </p>
//                                 </div>
//                             </div>

//                             <Link href="/admin/requests">
//                                 <Button
//                                     variant="outline"
//                                     className="flex items-center gap-2 border border-[#4789A8] text-[#4789A8] transition-all hover:bg-[#4789A8] hover:text-white"
//                                 >
//                                     <ArrowLeft className="h-4 w-4" />
//                                     Kembali
//                                 </Button>
//                             </Link>
//                         </div>
//                     </div>

//                     {/* Stats + Chart */}
//                     <div className="flex flex-col gap-6">
//                         {/* Stats */}
//                         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//                             <Card className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
//                                 <p className="text-sm text-gray-500">
//                                     Total Cost
//                                 </p>
//                                 <p className="mt-1 text-2xl font-bold text-gray-900">
//                                     Rp{stats.totalCost.toLocaleString('id-ID')}
//                                 </p>
//                             </Card>

//                             <Card className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
//                                 <p className="text-sm text-gray-500">
//                                     Total Order
//                                 </p>
//                                 <p className="mt-1 text-2xl font-bold text-gray-900">
//                                     {stats.totalOrder}
//                                 </p>
//                             </Card>

//                             <Card className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
//                                 <p className="text-sm text-gray-500">
//                                     Completed
//                                 </p>
//                                 <p className="mt-1 text-2xl font-bold text-gray-900">
//                                     {stats.completed}
//                                 </p>
//                             </Card>

//                             <Card className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
//                                 <p className="text-sm text-gray-500">
//                                     Canceled
//                                 </p>
//                                 <p className="mt-1 text-2xl font-bold text-gray-900">
//                                     {stats.canceled}
//                                 </p>
//                             </Card>
//                         </div>

//                         {/* Chart */}
//                         {/* <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//                             <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
//                                 Aktivitas Permintaan Mingguan
//                             </h3>
//                             <ResponsiveContainer width="100%" height={320}>
//                                 <BarChart
//                                     data={chart}
//                                     margin={{
//                                         top: 20,
//                                         right: 20,
//                                         left: 20,
//                                         bottom: 20,
//                                     }}
//                                     barCategoryGap="25%"
//                                 >
//                                     <defs>
//                                         <linearGradient
//                                             id="barDefault"
//                                             x1="0"
//                                             y1="0"
//                                             x2="0"
//                                             y2="1"
//                                         >
//                                             <stop
//                                                 offset="0%"
//                                                 stopColor="#7fb9cc"
//                                             />
//                                             <stop
//                                                 offset="100%"
//                                                 stopColor="#d3ebf2"
//                                             />
//                                         </linearGradient>
//                                     </defs>

//                                     <CartesianGrid
//                                         strokeDasharray="3 3"
//                                         stroke="#e5e7eb"
//                                     />

//                                     <XAxis
//                                         dataKey="day"
//                                         tick={{ fill: '#4b5563', fontSize: 12 }}
//                                         axisLine={false}
//                                         tickLine={false}
//                                         interval={0}
//                                     />

//                                     <YAxis
//                                         tick={{ fill: '#4b5563', fontSize: 12 }}
//                                         axisLine={false}
//                                         tickLine={false}
//                                     />

//                                     <Tooltip content={<CustomTooltip />} />

//                                     <Bar
//                                         dataKey="total"
//                                         radius={[12, 12, 0, 0]}
//                                         barSize={45}
//                                     >
//                                         {chart.map((_: any, i: any) => (
//                                             <Cell
//                                                 key={i}
//                                                 fill="url(#barDefault)"
//                                             />
//                                         ))}
//                                     </Bar>
//                                 </BarChart>
//                             </ResponsiveContainer>
//                         </Card> */}
//                     </div>

//                     {/* Request Table */}
//                     <Card className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
//                         <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
//                             <ShoppingBag className="h-5 w-5 text-[#4789A8]" />
//                             Daftar Request Item
//                         </h3>

//                         <div className="max-h-[280px] overflow-y-auto rounded-xl">
//                             <table className="w-full border-collapse text-center text-sm">
//                                 <thead className="sticky top-0 bg-slate-100 font-semibold text-slate-700">
//                                     <tr>
//                                         <th className="px-4 py-3">No</th>
//                                         <th className="px-4 py-3 text-left">
//                                             Item
//                                         </th>
//                                         <th className="px-4 py-3">Tanggal</th>
//                                         <th className="px-4 py-3">Jumlah</th>
//                                         <th className="px-4 py-3">Harga</th>
//                                         <th className="px-4 py-3">Total</th>
//                                     </tr>
//                                 </thead>

//                                 <tbody>
//                                     {requests.map((r: any, i: number) => (
//                                         <tr
//                                             key={i}
//                                             className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100`}
//                                         >
//                                             <td className="px-4 py-3">
//                                                 {i + 1}
//                                             </td>
//                                             <td className="px-4 py-3 text-left font-semibold">
//                                                 {r.item_name}
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 {r.created_at}
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 {r.qty}
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 Rp
//                                                 {r.price.toLocaleString(
//                                                     'id-ID',
//                                                 )}
//                                             </td>
//                                             <td className="px-4 py-3 font-bold">
//                                                 Rp
//                                                 {(
//                                                     r.qty * r.price
//                                                 ).toLocaleString('id-ID')}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>

//                         <p className="mt-2 text-xs text-slate-500 italic">
//                             Daftar request item terbaru.
//                         </p>
//                     </Card>

//                     {/* Riwayat Barang Masuk */}
//                     <Card className="mt-4 flex h-[400px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
//                         <div className="mb-3 flex items-center justify-between">
//                             <h3 className="flex items-center gap-2 font-bold text-slate-800">
//                                 <Truck className="h-5 w-5 text-[#4789A8]" />
//                                 Riwayat Barang Masuk
//                             </h3>
//                         </div>

//                         <div className="max-h-[280px] flex-1 overflow-y-auto rounded-xl">
//                             <table className="w-full border-collapse text-center text-sm">
//                                 <thead className="sticky top-0 bg-slate-100 font-semibold text-slate-700">
//                                     <tr>
//                                         <th className="px-4 py-3">No</th>
//                                         <th className="px-4 py-3 text-left">
//                                             Item
//                                         </th>
//                                         <th className="px-4 py-3">Tanggal</th>
//                                         <th className="px-4 py-3">Jumlah</th>
//                                         <th className="px-4 py-3">Harga</th>
//                                         <th className="px-4 py-3">Total</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {history.map((h: any, i: number) => (
//                                         <tr
//                                             key={i}
//                                             className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100`}
//                                         >
//                                             <td className="px-4 py-3">
//                                                 {i + 1}
//                                             </td>
//                                             <td className="px-4 py-3 text-left font-semibold">
//                                                 {h.item_name}
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 {h.created_at}
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 {h.qty}
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 Rp
//                                                 {h.price.toLocaleString(
//                                                     'id-ID',
//                                                 )}
//                                             </td>
//                                             <td className="px-4 py-3 font-bold">
//                                                 Rp
//                                                 {(
//                                                     h.qty * h.price
//                                                 ).toLocaleString('id-ID')}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>

//                         <p className="mt-2 text-left text-xs text-slate-500 italic">
//                             Daftar riwayat barang yang baru masuk ke gudang.
//                         </p>
//                     </Card>
//                 </div>
//             </div>
// >>>>>>> 4320a06f3f92fff7eae9d0f284321a5750263389
//         </div>
//     );
// }
