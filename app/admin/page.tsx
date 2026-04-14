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
    { label: "Total Products", value: productCount, icon: "📦", href: "/admin/products" },
    { label: "Locations", value: locationCount, icon: "📍", href: "/admin/locations" },
    { label: "Total Quantity", value: totalQty, icon: "🔢", href: "/admin/products" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-900">Dashboard</h2>
        <p className="text-zinc-500 text-sm mt-1">Overview of your inventory</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl border border-zinc-200 p-6 hover:border-zinc-400 transition-colors">
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="text-3xl font-bold text-zinc-900">{s.value}</div>
            <div className="text-sm text-zinc-500 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/admin/products" className="flex items-center gap-4 bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-900 transition-colors group">
          <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-xl group-hover:bg-zinc-900 group-hover:text-white transition-colors">📦</div>
          <div>
            <div className="text-sm font-semibold text-zinc-900">Add Product</div>
            <div className="text-xs text-zinc-400 mt-0.5">Name, size, price, quantity</div>
          </div>
        </Link>
        <Link href="/admin/locations" className="flex items-center gap-4 bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-900 transition-colors group">
          <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-xl group-hover:bg-zinc-900 group-hover:text-white transition-colors">📍</div>
          <div>
            <div className="text-sm font-semibold text-zinc-900">Add Location</div>
            <div className="text-xs text-zinc-400 mt-0.5">Store or site location</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
