"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  size: string;
  description: string;
  imageUrl: string;
  price: number;
  availableQty: number;
  totalQty: number;
};

type Location = {
  id: string;
  name: string;
};

type Allocation = {
  id: string;
  quantity: number;
  allocatedAt: string;
  product: { id: string; name: string; size: string; imageUrl: string };
  location: { id: string; name: string };
  manager: { id: string; name: string };
};

export default function ManagerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [recentAllocations, setRecentAllocations] = useState<Allocation[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    const [pr, lr, ar] = await Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/locations").then((r) => r.json()),
      fetch("/api/allocations").then((r) => r.json()),
    ]);
    setProducts(Array.isArray(pr) ? pr : []);
    setLocations(Array.isArray(lr) ? lr : []);
    setRecentAllocations(Array.isArray(ar) ? ar.slice(0, 10) : []);
  }

  useEffect(() => { load(); }, []);

  async function handleAllocate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct || !selectedLocation || !quantity) return;
    setError("");
    setSuccess("");
    setSubmitting(true);

    const res = await fetch("/api/allocations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProduct.id,
        locationId: selectedLocation,
        quantity: parseInt(quantity, 10),
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Allocation failed");
      return;
    }

    setSuccess(`Allocated ${quantity} × ${selectedProduct.name} successfully!`);
    setSelectedProduct(null);
    setSelectedLocation("");
    setQuantity("");
    load();
  }

  const maxQty = selectedProduct?.availableQty ?? 0;

  return (
    <div className="p-4 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Allocate Stock</h2>
        <p className="text-slate-500 text-sm mt-1">Assign product quantities to a store location</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: allocation form */}
        <div className="xl:col-span-2 space-y-6">

          {/* Step 1: Pick product */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black flex items-center justify-center">1</span>
              Select Product
            </h3>
            {products.length === 0 ? (
              <p className="text-sm text-slate-400">No products available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setSelectedProduct(p); setQuantity(""); setError(""); }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${
                      selectedProduct?.id === p.id
                        ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                    } ${p.availableQty === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                    disabled={p.availableQty === 0}
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <Image src={p.imageUrl} alt={p.name} fill className="object-cover" unoptimized />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.size}</p>
                      <p className={`text-xs font-bold mt-0.5 ${p.availableQty === 0 ? "text-red-500" : "text-emerald-600"}`}>
                        {p.availableQty === 0 ? "Out of stock" : `${p.availableQty} available`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Quantity + Location */}
          {selectedProduct && (
            <form onSubmit={handleAllocate} className="bg-white rounded-2xl border border-slate-200/60 p-5 sm:p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black flex items-center justify-center">2</span>
                Set Quantity &amp; Location
              </h3>

              {/* Selected product summary */}
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  <Image src={selectedProduct.imageUrl} alt={selectedProduct.name} fill className="object-cover" unoptimized />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{selectedProduct.name} <span className="text-slate-400 font-normal">({selectedProduct.size})</span></p>
                  <p className="text-xs text-emerald-700 font-medium">{selectedProduct.availableQty} units available</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    max={maxQty}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={`1 – ${maxQty}`}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  />
                  {quantity && parseInt(quantity) > maxQty && (
                    <p className="text-xs text-red-500 mt-1">Max available is {maxQty}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Location *</label>
                  <select
                    required
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  >
                    <option value="">Select location…</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</p>}
              {success && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">{success}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setSelectedProduct(null); setQuantity(""); setError(""); setSuccess(""); }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !quantity || !selectedLocation || parseInt(quantity) > maxQty}
                  className="flex-1 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:opacity-50 transition-all"
                >
                  {submitting ? "Allocating…" : "Confirm Allocation"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: recent allocations */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 sm:p-6 shadow-sm h-fit">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="text-base">🕓</span> Recent Allocations
          </h3>
          {recentAllocations.length === 0 ? (
            <p className="text-sm text-slate-400">No allocations yet.</p>
          ) : (
            <div className="space-y-3">
              {recentAllocations.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-slate-200 shrink-0 mt-0.5">
                    <Image src={a.product.imageUrl} alt={a.product.name} fill className="object-cover" unoptimized />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">{a.product.name}</p>
                    <p className="text-xs text-slate-500">{a.quantity} units → {a.location.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{a.manager.name} · {new Date(a.allocatedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">{a.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
