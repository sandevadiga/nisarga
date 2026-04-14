import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function AdminDashboard() {
  let productCount = 0, locationCount = 0, totalQty = 0;
  let products: any[] = [];
  let recentAllocations: any[] = [];

  try {
    const [pc, lc, qtyResult, prodData, allocData] = await Promise.all([
      prisma.product.count(),
      prisma.location.count(),
      prisma.product.aggregate({ _sum: { availableQty: true } }),
      prisma.product.findMany({ 
        orderBy: { updatedAt: "desc" },
        take: 8 
      }),
      prisma.allocation.findMany({
        take: 8,
        orderBy: { allocatedAt: "desc" },
        include: {
          product: { select: { id: true, name: true, size: true, imageUrl: true } },
          location: { select: { id: true, name: true } },
          manager: { select: { id: true, name: true } },
        },
      })
    ]);
    productCount = pc;
    locationCount = lc;
    totalQty = qtyResult._sum.availableQty ?? 0;
    products = prodData;
    recentAllocations = allocData;
  } catch (err) {
    console.error("[dashboard]", err);
  }

  const stats = [
    { label: "Total Products", value: productCount, icon: "📦", href: "/admin/products", color: "from-blue-500 to-indigo-600", shadow: "shadow-indigo-500/20" },
    { label: "Locations", value: locationCount, icon: "📍", href: "/admin/locations", color: "from-emerald-400 to-teal-500", shadow: "shadow-teal-500/20" },
    { label: "Available Stock", value: totalQty, icon: "🔢", href: "/admin/products", color: "from-orange-400 to-rose-500", shadow: "shadow-rose-500/20" },
  ];

  return (
    <div className="p-4 sm:p-8 lg:p-10 animate-fade-in relative">
      <div className="mb-8 sm:mb-10 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2 font-medium">Real-time insights and inventory metrics</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group relative bg-white rounded-[1.5rem] sm:rounded-3xl border border-slate-200/60 p-5 sm:p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 overflow-hidden flex items-center gap-5">
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${s.color} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 ease-in-out`} />
            <div className={`shrink-0 inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg ${s.shadow} transform group-hover:scale-105 transition-transform duration-300 text-xl sm:text-2xl`}>
              {s.icon}
            </div>
            <div className="relative z-10 flex-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-0.5">{s.value}</div>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-widest">{s.label}</div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 hidden sm:flex shrink-0 w-8 h-8 rounded-full bg-slate-50 items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Inventory Overview Table */}
        <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border border-slate-200/60 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-full">
          <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Inventory Master
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Snapshot of current product levels</p>
            </div>
            <Link href="/admin/products" className="text-[10px] sm:text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
              View All
            </Link>
          </div>
          
          {products.length === 0 ? (
            <div className="p-10 text-center flex-1 flex flex-col items-center justify-center">
              <div className="text-3xl mb-3 opacity-50">📋</div>
              <p className="text-slate-500 text-sm">No products found in inventory.</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-[#fcfdfd] border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 sm:px-8 py-3 sm:py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] whitespace-nowrap">Product Name</th>
                    <th className="text-center px-4 py-3 sm:py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] whitespace-nowrap">Total</th>
                    <th className="text-right px-6 sm:px-8 py-3 sm:py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] whitespace-nowrap">Status & Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 sm:px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <Image src={p.imageUrl} alt={p.name} fill className="object-cover" unoptimized />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap text-xs sm:text-sm">{p.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{p.size}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-xs sm:text-sm font-semibold text-slate-500">{p.totalQty}</span>
                      </td>
                      <td className="px-6 sm:px-8 py-4 w-40">
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`text-xs font-bold ${p.availableQty === 0 ? 'text-red-500' : p.availableQty < p.totalQty * 0.2 ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {p.availableQty} left
                          </span>
                          <div className="w-full sm:w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden flex justify-end">
                            <div 
                              className={`h-full rounded-full ${p.availableQty === 0 ? 'bg-red-500' : p.availableQty < p.totalQty * 0.2 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.max(5, (p.availableQty / p.totalQty) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Manager Allocations Table */}
        <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border border-slate-200/60 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-full">
          <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                Recent Allocations
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Workflows processed by managers</p>
            </div>
          </div>
          
          {recentAllocations.length === 0 ? (
            <div className="p-10 text-center flex-1 flex flex-col items-center justify-center">
              <div className="text-3xl mb-3 opacity-50">🕓</div>
              <p className="text-slate-500 text-sm">No recent allocations history.</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-[#fcfdfd] border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 sm:px-8 py-3 sm:py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] whitespace-nowrap">Manager & Date</th>
                    <th className="text-left px-4 py-3 sm:py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] whitespace-nowrap">Product Assigned</th>
                    <th className="text-right px-6 sm:px-8 py-3 sm:py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] whitespace-nowrap">Shipped To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentAllocations.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 sm:px-8 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm whitespace-nowrap">{a.manager.name}</span>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {new Date(a.allocatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center font-black text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md text-[10px] sm:text-xs min-w-[2rem]">
                            {a.quantity}
                          </span>
                          <div className="min-w-0 max-w-[120px] sm:max-w-[200px]">
                            <p className="font-semibold text-slate-700 truncate text-xs sm:text-sm group-hover:text-teal-700 transition-colors">{a.product.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{a.product.size}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 sm:px-8 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-xs">📍</span>
                          <span className="font-semibold text-slate-600 whitespace-nowrap text-xs truncate max-w-[100px]">{a.location.name}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
