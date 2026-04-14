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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Products</h2>
          <p className="text-zinc-500 text-sm mt-1">{products.length} product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-8">
          <h3 className="text-sm font-semibold text-zinc-700 mb-5">New Product</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Product Name *</label>
              <input name="name" required value={form.name} onChange={handleChange} placeholder="e.g. Cement Bag"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Size *</label>
              <input name="size" required value={form.size} onChange={handleChange} placeholder="e.g. 50kg"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Price (₹) *</label>
              <input name="price" required type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Quantity *</label>
              <input name="quantity" required type="number" min="1" value={form.quantity} onChange={handleChange} placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-zinc-600 mb-1">Product Image *</label>
              <div
                className="relative border-2 border-dashed border-zinc-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-zinc-500 transition-colors bg-zinc-50"
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
                  <div className="relative w-full h-36">
                    <Image src={imagePreview} alt="Preview" fill className="object-contain rounded" unoptimized />
                    {uploading && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded text-xs text-zinc-500">
                        Uploading…
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="text-2xl text-zinc-400">📷</div>
                    <p className="text-xs text-zinc-500">Click to choose an image</p>
                    <p className="text-xs text-zinc-400">JPEG, PNG, WebP, GIF — max 5 MB</p>
                  </>
                )}
              </div>
              {form.imageUrl && !uploading && (
                <p className="text-xs text-green-600 mt-1">Image uploaded successfully</p>
              )}
              <input type="hidden" name="imageUrl" value={form.imageUrl} required />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-zinc-600 mb-1">Description *</label>
              <textarea name="description" required value={form.description} onChange={handleChange} placeholder="Brief description…" rows={3}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none" />
            </div>
            {error && <p className="col-span-2 text-xs text-red-500">{error}</p>}
            <div className="col-span-2 flex justify-end">
              <button type="submit" disabled={loading || uploading}
                className="px-6 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors">
                {loading ? "Saving…" : uploading ? "Uploading image…" : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center text-zinc-400 text-sm">
          No products yet. Add your first product above.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
              <div className="relative h-40 bg-zinc-100">
                <Image src={p.imageUrl} alt={p.name} fill className="object-cover" unoptimized />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-zinc-900 text-sm">{p.name}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{p.size}</p>
                  </div>
                  <span className="text-sm font-bold text-zinc-900">₹{p.price}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100">
                  <span className="text-xs text-zinc-500">Available</span>
                  <span className="text-sm font-semibold text-zinc-900">{p.availableQty} / {p.totalQty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
