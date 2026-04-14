import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  let productCount = 0, locationCount = 0, totalQty = 0;
  try {
    const [pc, lc, qtyResult] = await Promise.all([
      prisma.product.count(),
      prisma.location.count(),
      prisma.product.aggregate({ _sum: { availableQty: true } }),
    ]);
    productCount = pc;
    locationCount = lc;
    totalQty = qtyResult._sum.availableQty ?? 0;
  } catch (err) {
    console.error("[dashboard]", err);
  }

  const stats = [
    { label: "Total Products", value: productCount, icon: "📦", href: "/admin/products", color: "from-blue-500 to-indigo-600", shadow: "shadow-indigo-500/20" },
    { label: "Locations", value: locationCount, icon: "📍", href: "/admin/locations", color: "from-emerald-400 to-teal-500", shadow: "shadow-teal-500/20" },
    { label: "Total Quantity", value: totalQty, icon: "🔢", href: "/admin/ محصولات", color: "from-orange-400 to-rose-500", shadow: "shadow-rose-500/20" },
  ];

  return (
    <div className="p-4 sm:p-8 lg:p-10 animate-fade-in">
      <div className="mb-8 sm:mb-10 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2 font-medium">Real-time insights and inventory metrics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group relative bg-white rounded-[1.5rem] sm:rounded-3xl border border-slate-200/60 p-5 sm:p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 overflow-hidden">
            <div className={`absolute -right-6 -top-6 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br ${s.color} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 ease-in-out`} />
            <div className="relative z-10">
              <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg ${s.shadow} mb-4 sm:mb-6 transform group-hover:-translate-y-1 transition-transform duration-300 text-xl sm:text-2xl`}>
                {s.icon}
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1">{s.value}</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-widest">{s.label}</div>
              </div>
            </div>
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 hidden sm:block">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border border-slate-200/60 p-5 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 sm:mb-6 flex items-center justify-center sm:justify-start gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <Link href="/admin/products" className="group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 bg-slate-50 rounded-2xl p-5 sm:p-6 hover:bg-slate-900 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl sm:text-2xl group-hover:bg-slate-800 group-hover:text-white transition-colors duration-300 transform group-hover:scale-110 shrink-0">📦</div>
            <div>
              <div className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-white transition-colors">Add Product</div>
              <div className="text-xs sm:text-sm text-slate-500 group-hover:text-slate-400 mt-1 transition-colors">Name, size, price, quantity</div>
            </div>
            <div className="sm:ml-auto opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </Link>
          <Link href="/admin/locations" className="group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 bg-slate-50 rounded-2xl p-5 sm:p-6 hover:bg-slate-900 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl sm:text-2xl group-hover:bg-slate-800 group-hover:text-white transition-colors duration-300 transform group-hover:scale-110 shrink-0">📍</div>
            <div>
              <div className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-white transition-colors">Add Location</div>
              <div className="text-xs sm:text-sm text-slate-500 group-hover:text-slate-400 mt-1 transition-colors">Store or site location</div>
            </div>
            <div className="sm:ml-auto opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
