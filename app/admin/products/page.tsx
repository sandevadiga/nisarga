"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  size: string;
  description: string;
  imageUrl: string;
  price: number;
  totalQty: number;
  availableQty: number;
};

const EMPTY = { name: "", size: "", description: "", imageUrl: "", price: "", quantity: "" };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function fetchProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  }

  useEffect(() => { fetchProducts(); }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    setError("");

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(false);

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Image upload failed");
      setImagePreview(null);
      return;
    }
    const { url } = await res.json();
    setForm((f) => ({ ...f, imageUrl: url }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        size: form.size,
        description: form.description,
        imageUrl: form.imageUrl,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to add product");
      return;
    }
    setForm(EMPTY);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
    setShowForm(false);
    fetchProducts();
  }

  return (
    <div className="p-4 sm:p-8 lg:p-10 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between mb-8 sm:mb-10 gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-3">
            Products Directory
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2 font-medium flex items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
              {products.length}
            </span>
            registered product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center ${
            showForm 
              ? "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200" 
              : "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50"
          }`}
        >
          {showForm ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Cancel
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Product
            </>
          )}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border border-slate-200/60 p-5 sm:p-8 mb-8 sm:mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
          
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
            New Product Details
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative z-10">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5 sm:mb-2">Product Name *</label>
              <input name="name" required value={form.name} onChange={handleChange} placeholder="e.g. Premium Cement Bag"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors shadow-sm" />
            </div>
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5 sm:mb-2">Size *</label>
              <input name="size" required value={form.size} onChange={handleChange} placeholder="e.g. 50kg, Medium"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors shadow-sm" />
            </div>
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5 sm:mb-2">Price (₹) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                <input name="price" required type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors shadow-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5 sm:mb-2">Initial Quantity *</label>
              <input name="quantity" required type="number" min="1" value={form.quantity} onChange={handleChange} placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors shadow-sm" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5 sm:mb-2">Product Image *</label>
              <div
                className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition-all duration-200 bg-slate-50/50 group"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {imagePreview ? (
                  <div className="relative w-full h-40 sm:h-48 rounded-xl overflow-hidden shadow-inner bg-white">
                    <Image src={imagePreview} alt="Preview" fill className="object-contain" unoptimized />
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-sm font-semibold text-indigo-600">
                        <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading asset...
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all duration-300">📷</div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700">Click to upload an image</p>
                      <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP, GIF — up to 5 MB</p>
                    </div>
                  </>
                )}
              </div>
              {form.imageUrl && !uploading && (
                <div className="flex items-center gap-2 mt-3 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg inline-flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Image uploaded successfully
                </div>
              )}
              <input type="hidden" name="imageUrl" value={form.imageUrl} required />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5 sm:mb-2">Description *</label>
              <textarea name="description" required value={form.description} onChange={handleChange} placeholder="Provide details about the product..." rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none transition-colors shadow-sm" />
            </div>

            {error && (
              <div className="md:col-span-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <div className="md:col-span-2 flex justify-end pt-4 border-t border-slate-100">
              <button type="submit" disabled={loading || uploading}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg transition-all duration-200">
                {loading ? "Saving Product..." : uploading ? "Waiting for upload..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border border-slate-200/60 p-10 sm:p-16 text-center shadow-sm">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-full flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-4 sm:mb-6 text-slate-300">📦</div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">No products found</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm sm:text-base">Your inventory is currently empty. Start by adding your first product using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p, i) => (
            <div key={p.id} className="group bg-white rounded-[1.5rem] sm:rounded-3xl border border-slate-200/60 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col animate-fade-in" style={{animationDelay: `${i * 50}ms`, animationFillMode: 'both'}}>
              <div className="relative h-40 sm:h-48 bg-slate-50 overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Image src={p.imageUrl} alt={p.name} fill className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out" unoptimized />
                <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-slate-900 shadow-sm border border-slate-100">
                  ₹{p.price.toLocaleString()}
                </div>
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col">
                <div className="mb-2 sm:mb-3 border-b border-slate-100 pb-2 sm:pb-3">
                  <h4 className="font-extrabold text-slate-900 text-base sm:text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors">{p.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{p.size}</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 flex-1 line-clamp-2 mb-3 sm:mb-4 leading-relaxed">{p.description}</p>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mt-auto">
                  <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 sm:mb-2">
                    <span>Stock Level</span>
                    <span>{Math.round((p.availableQty / p.totalQty) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 sm:h-2 mb-1.5 sm:mb-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${p.availableQty < p.totalQty * 0.2 ? 'bg-red-500' : p.availableQty < p.totalQty * 0.5 ? 'bg-amber-400' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.max(5, (p.availableQty / p.totalQty) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                    <span className="text-slate-900">{p.availableQty} <span className="text-[10px] sm:text-xs font-medium text-slate-500">avail</span></span>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-900">{p.totalQty} <span className="text-[10px] sm:text-xs font-medium text-slate-500">total</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
