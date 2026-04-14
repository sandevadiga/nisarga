import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white/80 backdrop-blur-xl border-b border-slate-200/60 p-4 sticky top-0 z-30 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/20 text-white flex items-center justify-center font-bold text-lg">
            N
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Nisarga</h1>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">Store Admin</p>
          </div>
        </div>
        <LogoutButton />
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 sticky top-0 h-screen">
        <div className="px-6 py-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/20 text-white flex items-center justify-center font-bold text-lg">
            N
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Nisarga</h1>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">Store Admin</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
          <Link href="/admin" className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200">
            <span className="text-xl transform group-hover:scale-110 transition-transform">📊</span> Dashboard
          </Link>
          <Link href="/admin/products" className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200">
            <span className="text-xl transform group-hover:scale-110 transition-transform">📦</span> Products
          </Link>
          <Link href="/admin/locations" className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200">
            <span className="text-xl transform group-hover:scale-110 transition-transform">📍</span> Locations
          </Link>
          <Link href="/admin/allocations" className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200">
            <span className="text-xl transform group-hover:scale-110 transition-transform">🕓</span> History
          </Link>
        </nav>
        <div className="px-4 py-6 border-t border-slate-100 bg-slate-50/50">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-slate-50 relative pb-24 md:pb-0 min-h-[calc(100vh-64px)] md:min-h-screen">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 px-4 py-3 pb-safe z-40 flex items-center justify-between shadow-[0_-4px_24px_rgba(0,0,0,0.06)] overflow-x-auto">
        <Link href="/admin" className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-indigo-600 transition-colors mx-1">
          <span className="text-2xl">📊</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider">Home</span>
        </Link>
        <Link href="/admin/locations" className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-indigo-600 transition-colors mx-1">
          <span className="text-2xl">📍</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider">Store</span>
        </Link>
        <Link href="/admin/products" className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-indigo-600 transition-colors relative mx-2">
          <div className="absolute -top-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/30 border-4 border-slate-50 transform hover:-translate-y-1 transition-transform">
            📦
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider mt-5">Products</span>
        </Link>
        <Link href="/admin/allocations" className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-indigo-600 transition-colors mx-1">
          <span className="text-2xl">🕓</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider">Log</span>
        </Link>
      </nav>
    </div>
  );
}
