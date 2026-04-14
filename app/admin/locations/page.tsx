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
    <div className="p-8 lg:p-10 animate-fade-in">
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          Locations Management
        </h2>
        <p className="text-slate-500 text-sm mt-2 font-medium">Configure store fronts and warehouse sites</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-8">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-xl text-emerald-500 mb-6">
              📍
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">New Location</h3>
            <p className="text-sm text-slate-500 mb-6">Add a new facility to track inventory across different regions.</p>
            
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 uppercase tracking-widest mb-2">Location Name</label>
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
          <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)] h-full">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">Active Facilities</h3>
              <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                {locations.length} Total
              </span>
            </div>
            
            {locations.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 text-slate-300">🏢</div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">No locations registered</h4>
                <p className="text-slate-500 text-sm">Use the form to add your first facility.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white border-b border-slate-100">
                    <tr>
                      <th className="text-left px-8 py-4 font-bold text-slate-400 uppercase tracking-wider text-xs">#</th>
                      <th className="text-left px-8 py-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Facility Name</th>
                      <th className="text-left px-8 py-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Date Added</th>
                      <th className="text-right px-8 py-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {locations.map((loc, i) => (
                      <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-8 py-5 text-slate-400 font-medium">{(i + 1).toString().padStart(2, '0')}</td>
                        <td className="px-8 py-5 font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{loc.name}</td>
                        <td className="px-8 py-5 text-slate-500 font-medium">{new Date(loc.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td className="px-8 py-5 text-right">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
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
