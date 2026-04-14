"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

type Allocation = {
  id: string;
  quantity: number;
  allocatedAt: string;
  product: { id: string; name: string; size: string; imageUrl: string };
  location: { id: string; name: string };
  manager: { id: string; name: string };
};

export default function HistoryPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchHistory() {
    setLoading(true);
    try {
      const res = await fetch("/api/allocations");
      if (res.ok) {
        const data = await res.json();
        setAllocations(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="p-4 sm:p-8 lg:p-10 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between mb-8 sm:mb-10 gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-3">
            Allocation History
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2 font-medium flex items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
              {allocations.length}
            </span>
            total transfer{allocations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
        >
          <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border border-slate-200/60 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative z-10 w-full mb-20 lg:mb-0">
        {loading && allocations.length === 0 ? (
          <div className="p-16 text-center text-slate-400">Loading history...</div>
        ) : allocations.length === 0 ? (
          <div className="p-10 sm:p-16 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-4 text-slate-300">🕓</div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-1">No allocations found</h4>
            <p className="text-slate-500 text-xs sm:text-sm">Stock tracking history will appear here once managers start allocating.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#fcfdfd] border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs">Product Details</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs">Location Assigned</th>
                  <th className="text-center px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs">Quantity</th>
                  <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs">Transaction Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allocations.map((a, i) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors group animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 shrink-0 shadow-sm">
                          <Image src={a.product.imageUrl} alt={a.product.name} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors text-xs sm:text-sm">{a.product.name}</div>
                          <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{a.product.size}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 group-hover:border-emerald-200 transition-colors max-w-full">
                        <span className="text-base shrink-0">📍</span>
                        <span className="font-semibold text-slate-700 truncate text-xs sm:text-sm">{a.location.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs sm:text-sm border border-emerald-100 shadow-sm min-w-[3rem]">
                        {a.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-slate-900 text-xs sm:text-sm truncate">{a.manager.name}</div>
                      <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                        {new Date(a.allocatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
  );
}
