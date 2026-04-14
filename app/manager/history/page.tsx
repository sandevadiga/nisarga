"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";

type FilterEntity = { id: string; name: string };
type Allocation = {
  id: string;
  quantity: number;
  completedQty: number;
  allocatedAt: string;
  product: { id: string; name: string; size: string; imageUrl: string };
  location: { id: string; name: string };
  manager: { id: string; name: string };
};

export default function HistoryPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [locations, setLocations] = useState<FilterEntity[]>([]);
  const [products, setProducts] = useState<FilterEntity[]>([]);
  
  // Filters
  const [selectedManager, setSelectedManager] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  
  const [loading, setLoading] = useState(true);

  // Extract unique managers from the loaded history
  const managers = useMemo(() => {
    const map = new Map<string, FilterEntity>();
    allocations.forEach(a => map.set(a.manager.id, a.manager));
    return Array.from(map.values());
  }, [allocations]);

  async function fetchFiltersBase() {
    try {
      const [locRes, prodRes] = await Promise.all([
        fetch("/api/locations"),
        fetch("/api/products")
      ]);
      if (locRes.ok) setLocations(await locRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch(err) {
      console.error(err);
    }
  }

  async function fetchHistory() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedManager) params.append("managerId", selectedManager);
      if (selectedLocation) params.append("locationId", selectedLocation);
      if (selectedProduct) params.append("productId", selectedProduct);

      const res = await fetch(`/api/allocations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAllocations(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  // Initial load
  useEffect(() => {
    fetchFiltersBase();
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update on filter change
  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManager, selectedLocation, selectedProduct]);


  async function handleMarkComplete(id: string, currentCompleted: number, total: number) {
    const remaining = total - currentCompleted;
    if (remaining <= 0) return;

    const input = window.prompt(`How many items have been processed/completed?\nRemaining to complete: ${remaining}`, remaining.toString());
    if (!input) return;

    const qty = parseInt(input, 10);
    if (isNaN(qty) || qty <= 0 || qty > remaining) {
      alert("Invalid quantity. Must be between 1 and " + remaining);
      return;
    }

    try {
      const res = await fetch(`/api/allocations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "COMPLETE", additionalCompletedQty: qty })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert("Successfully marked as completed.");
      fetchHistory();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleEditQuantity(id: string, currentTotal: number) {
    const input = window.prompt("Edit allocated quantity (Warning: this alters total product stock limits):", currentTotal.toString());
    if (!input) return;

    const qty = parseInt(input, 10);
    if (isNaN(qty) || qty <= 0) {
      alert("Invalid quantity. Must be at least 1.");
      return;
    }

    if (qty === currentTotal) return;

    try {
      const res = await fetch(`/api/allocations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "EDIT", quantity: qty })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert("Successfully edited allocation quantity.");
      fetchHistory();
    } catch (e: any) {
      alert(e.message);
    }
  }


  return (
    <div className="p-4 sm:p-8 lg:p-10 animate-fade-in relative min-h-screen">
      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-3">
            Allocation History
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2 font-medium flex items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
              {allocations.length}
            </span>
            total transfer{allocations.length !== 1 ? "s" : ""} securely logged
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
          {loading ? "Refreshing..." : "Force Refresh"}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 mb-8 border border-slate-200/60 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3 relative z-20">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Filter by Product</label>
          <select 
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2 transition-colors"
          >
            <option value="">All Products</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Filter by Location</label>
          <select 
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2 transition-colors"
          >
            <option value="">All Locations</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Filter by Manager</label>
          <select 
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2 transition-colors"
          >
            <option value="">All Managers</option>
            {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border border-slate-200/60 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative z-10 w-full mb-20 lg:mb-0">
        {loading && allocations.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-medium animate-pulse">Syncing allocations log...</div>
        ) : allocations.length === 0 ? (
          <div className="p-10 sm:p-16 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-4 text-slate-300">🕓</div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-1">No allocations found</h4>
            <p className="text-slate-500 text-xs sm:text-sm">No assignments match your current filters.</p>
            {(selectedManager || selectedLocation || selectedProduct) && (
              <button 
                onClick={() => { setSelectedManager(""); setSelectedLocation(""); setSelectedProduct(""); }}
                className="mt-4 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto pb-10">
            <table className="w-full text-sm">
              <thead className="bg-[#fcfdfd] border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap">Product Details</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap">Location & Progress</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap">Manufacturing Actions</th>
                  <th className="text-right px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap">Transaction Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allocations.map((a, i) => {
                  const diffMs = Date.now() - new Date(a.allocatedAt).getTime();
                  const isEditable = diffMs <= 5 * 60 * 1000;
                  const isFullyCompleted = a.completedQty >= a.quantity;
                  const progressPerc = Math.max(0, Math.min(100, (a.completedQty / a.quantity) * 100));

                  return (
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
                      
                      <td className="px-6 py-4 min-w-[200px]">
                        <div className="flex flex-col gap-2">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 group-hover:border-emerald-200 transition-colors w-fit">
                            <span className="text-xs shrink-0">📍</span>
                            <span className="font-semibold text-slate-700 truncate text-[10px] sm:text-xs">{a.location.name}</span>
                          </div>
                          <div className="flex flex-col gap-1 w-full max-w-[180px]">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className={isFullyCompleted ? "text-emerald-600" : "text-amber-500"}>
                                {a.completedQty} / {a.quantity}
                              </span>
                              <span className="text-slate-400 uppercase tracking-widest text-[8px]">{isFullyCompleted ? 'READY' : 'IN PROGRESS'}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${isFullyCompleted ? "bg-emerald-500" : "bg-amber-400"}`}
                                style={{ width: `${progressPerc}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           <button
                             onClick={() => handleMarkComplete(a.id, a.completedQty, a.quantity)}
                             disabled={isFullyCompleted}
                             className="px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600 shrink-0"
                           >
                             Log Progress
                           </button>

                           {isEditable ? (
                             <button
                               onClick={() => handleEditQuantity(a.id, a.quantity)}
                               className="px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
                               title="Edit quantity (only available within 5 mins of creation)"
                             >
                               Edit Qty
                             </button>
                           ) : (
                             <button
                               onClick={() => alert("Time limit exceeded. Please contact Admin to do it.")}
                               className="px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg border border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors"
                             >
                               <span className="mr-1">🔒</span> Locked
                             </button>
                           )}
                         </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="font-medium text-slate-900 text-xs sm:text-sm truncate">{a.manager.name}</div>
                        <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                          {new Date(a.allocatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
