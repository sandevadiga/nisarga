"use client";
import { useState, useEffect } from "react";

type Location = { id: string; name: string; createdAt: string };

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchLocations() {
    const res = await fetch("/api/locations");
    const data = await res.json();
    setLocations(data);
  }

  useEffect(() => { fetchLocations(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to add location");
      return;
    }
    setName("");
    fetchLocations();
  }

  return (
    <div className="p-4 sm:p-8 lg:p-10 animate-fade-in">
      <div className="mb-8 sm:mb-10 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-3">
          Locations Management
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2 font-medium">Configure store fronts and warehouse sites</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Add form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-lg sm:text-xl text-emerald-500 mb-4 sm:mb-6">
              📍
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">New Location</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">Add a new facility to track inventory across different regions.</p>
            
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5 sm:mb-2">Location Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Downtown Warehouse"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors shadow-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200"
              >
                {loading ? "Registering..." : "Add Location"}
              </button>
            </form>
            {error && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border border-slate-200/60 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)] h-full">
            <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Active Facilities</h3>
              <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">
                {locations.length} Total
              </span>
            </div>
            
            {locations.length === 0 ? (
              <div className="p-10 sm:p-16 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-4 text-slate-300">🏢</div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-1">No locations registered</h4>
                <p className="text-slate-500 text-xs sm:text-sm">Use the form to add your first facility.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white border-b border-slate-100">
                    <tr>
                      <th className="text-left px-6 sm:px-8 py-3 sm:py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap">#</th>
                      <th className="text-left px-6 sm:px-8 py-3 sm:py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap">Facility Name</th>
                      <th className="text-left px-6 sm:px-8 py-3 sm:py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap">Date Added</th>
                      <th className="text-right px-6 sm:px-8 py-3 sm:py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {locations.map((loc, i) => (
                      <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 sm:px-8 py-4 sm:py-5 text-slate-400 font-medium whitespace-nowrap text-xs sm:text-sm">{(i + 1).toString().padStart(2, '0')}</td>
                        <td className="px-6 sm:px-8 py-4 sm:py-5 font-bold text-slate-900 group-hover:text-emerald-600 transition-colors whitespace-nowrap text-xs sm:text-sm">{loc.name}</td>
                        <td className="px-6 sm:px-8 py-4 sm:py-5 text-slate-500 font-medium whitespace-nowrap text-xs sm:text-sm">{new Date(loc.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td className="px-6 sm:px-8 py-4 sm:py-5 text-right whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
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
    </div>
  );
}
