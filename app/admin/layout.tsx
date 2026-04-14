import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-zinc-200 flex flex-col">
        <div className="px-6 py-5 border-b border-zinc-100">
          <h1 className="text-lg font-bold text-zinc-900">Nisarga</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Store Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
            <span>📦</span> Products
          </Link>
          <Link href="/admin/locations" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
            <span>📍</span> Locations
          </Link>
        </nav>
        <div className="px-3 py-4 border-t border-zinc-100">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
