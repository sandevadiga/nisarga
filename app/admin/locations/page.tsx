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
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-900">Locations</h2>
        <p className="text-zinc-500 text-sm mt-1">Manage store and site locations</p>
      </div>

      {/* Add form */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-8 max-w-md">
        <h3 className="text-sm font-semibold text-zinc-700 mb-4">Add Location</h3>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Location name"
            className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Adding…" : "Add"}
          </button>
        </form>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {locations.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-sm">No locations yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-zinc-600">#</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-600">Name</th>
                <th className="text-left px-5 py-3 font-medium text-zinc-600">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {locations.map((loc, i) => (
                <tr key={loc.id} className="hover:bg-zinc-50">
                  <td className="px-5 py-3 text-zinc-400">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-zinc-900">{loc.name}</td>
                  <td className="px-5 py-3 text-zinc-400">{new Date(loc.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
