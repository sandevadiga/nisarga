"use client";

import { useEffect, useState, useMemo } from "react";
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

export default function AdminAllocationsHistory() {
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
        setAllocations(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  // Initial load
  useEffect(() => {
    fetchFiltersBase();
    fetchHistory(); // Fetches all allocations to extract managers initially
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update on filter change
  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManager, selectedLocation, selectedProduct]);

  return (
    <div className="p-4 sm:p-8 lg:p-10 animate-fade-in relative min-h-screen pb-32">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <span className="text-indigo-600">🕓</span> Allocation Tracking Log
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2 font-medium max-w-2xl">
          Deep-filter through all system transactions. Monitor specific managers, locations, or products easily.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[1.5rem] p-4 sm:p-6 mb-8 border border-slate-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] grid grid-cols-1 md:grid-cols-3 gap-4 relative z-20">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Filter by Manager</label>
          <select 
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-colors"
          >
            <option value="">All Managers</option>
            {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Filter by Location</label>
          <select 
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-colors"
          >
            <option value="">All Locations</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Filter by Product</label>
          <select 
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-colors"
          >
            <option value="">All Products</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border border-slate-200/60 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative z-10 w-full mb-10">
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <h3 className="text-sm font-bold text-slate-900">
              Transactions
              <span className="ml-2 inline-flex items-center justify-center bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                {allocations.length}
              </span>
           </h3>
           <button 
             onClick={() => fetchHistory()} 
             className="text-indigo-600 hover:text-indigo-700 p-2 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
             title="Force Refresh"
           >
             <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
           </button>
        </div>

        {loading && allocations.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-medium animate-pulse">Scanning ledgers...</div>
        ) : allocations.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-4xl sm:text-5xl mb-4 opacity-50">📂</div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-1">No matching records</h4>
            <p className="text-slate-500 text-sm">Try adjusting or clearing your filters above.</p>
            {(selectedManager || selectedLocation || selectedProduct) && (
              <button 
                onClick={() => { setSelectedManager(""); setSelectedLocation(""); setSelectedProduct(""); }}
                className="mt-4 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#fcfdfd] border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] whitespace-nowrap">Transaction ID & Date</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] whitespace-nowrap">Assigned By</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] whitespace-nowrap">Product Details</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] whitespace-nowrap">Location Shipped</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allocations.map((a, i) => (
                  <tr key={a.id} className="hover:bg-indigo-50/30 transition-colors group">
                    
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-slate-400 mb-1 truncate max-w-[120px]">{a.id.slice(0,8)}...</div>
                      <div className="font-semibold text-slate-800 text-xs sm:text-sm whitespace-nowrap">
                         {new Date(a.allocatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                           {a.manager.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700 whitespace-nowrap">{a.manager.name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 min-w-[300px]">
                      <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm transition-shadow group-hover:shadow-md">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                          <Image src={a.product.imageUrl} alt={a.product.name} fill className="object-cover" unoptimized />
                        </div>
                        <div className="flex-1 min-w-0 pr-3 border-r border-slate-100">
                          <div className="font-bold text-slate-900 break-words group-hover:text-indigo-600 transition-colors text-xs sm:text-sm">{a.product.name}</div>
                          <div className="text-[10px] sm:text-xs text-slate-500 truncate mb-2">{a.product.size}</div>
                          
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className={a.completedQty >= a.quantity ? "text-emerald-600" : "text-amber-500"}>
                                {a.completedQty} / {a.quantity}
                              </span>
                              <span className="text-slate-400 uppercase tracking-widest text-[8px]">{a.completedQty >= a.quantity ? 'READY' : 'IN PROGRESS'}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${a.completedQty >= a.quantity ? "bg-emerald-500" : "bg-amber-400"}`}
                                style={{ width: `${Math.max(0, Math.min(100, (a.completedQty / a.quantity) * 100))}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="px-3 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Total Limit</span>
                          <span className="font-black text-indigo-600 leading-none">{a.quantity}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-full sm:w-auto overflow-hidden">
                        <span className="text-sm shrink-0">📍</span>
                        <span className="font-bold text-slate-600 truncate text-xs sm:text-sm max-w-[150px]">{a.location.name}</span>
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
