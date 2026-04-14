"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // added to hint them to go to history

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
  completedQty: number;
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
      load();
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
      load();
    } catch (e: any) {
      alert(e.message);
    }
  }

  const maxQty = selectedProduct?.availableQty ?? 0;

  return (
    <div className="p-4 sm:p-8 lg:p-10 pb-32">
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="text-base">🕓</span> Active Workflow
            </h3>
            <Link href="/manager/history" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
              View All 
            </Link>
          </div>
          {recentAllocations.length === 0 ? (
            <p className="text-sm text-slate-400">No allocations yet.</p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {recentAllocations.map((a) => {
                const diffMs = Date.now() - new Date(a.allocatedAt).getTime();
                const isEditable = diffMs <= 5 * 60 * 1000;
                const isFullyCompleted = a.completedQty >= a.quantity;
                const progressPerc = Math.max(0, Math.min(100, (a.completedQty / a.quantity) * 100));

                return (
                  <div key={a.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0 mt-0.5">
                        <Image src={a.product.imageUrl} alt={a.product.name} fill className="object-cover" unoptimized />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">{a.product.name}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500 font-medium">📍 {a.location.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(a.allocatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 w-full bg-white p-2 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between text-[10px] font-bold px-1">
                        <span className={isFullyCompleted ? "text-emerald-600" : "text-amber-600"}>
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

                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => handleMarkComplete(a.id, a.completedQty, a.quantity)}
                        disabled={isFullyCompleted}
                        className="flex-1 py-1.5 text-[10px] font-bold rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-40 disabled:border-slate-200 disabled:text-slate-500 disabled:bg-slate-50 text-center shadow-sm"
                      >
                        {isFullyCompleted ? "Completed" : "Log Progress"}
                      </button>

                      {isEditable ? (
                        <button
                          onClick={() => handleEditQuantity(a.id, a.quantity)}
                          className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm bg-white shrink-0"
                          title="Edit quantity (only available within 5 mins of creation)"
                        >
                          ✏️ Edit Qty
                        </button>
                      ) : (
                        <button
                          onClick={() => alert("Time limit exceeded. Please contact Admin to do it.")}
                          className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors bg-white shrink-0"
                        >
                          🔒 Locked
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
