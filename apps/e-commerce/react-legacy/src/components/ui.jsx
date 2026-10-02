import React, { useState } from "react";
import {
  PackagePlus,
  ArrowRightLeft,
  AlertTriangle,
  Boxes,
  MapPin,
  X,
  CreditCard,
  BarChart3,
  Users,
} from "lucide-react";
import { money } from "../data";

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0c0c0c] p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PageTitle({ icon: Icon, eyebrow, title, subtitle }) {
  return (
    <div className="mb-7">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-red-500">
        <Icon size={15} /> {eyebrow}
      </div>
      <h1 className="text-3xl font-black sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
    </div>
  );
}

export function MiniMetric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <Icon size={17} className="mb-3 text-red-500" />
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs text-zinc-600">{label}</div>
    </div>
  );
}

export function StatCard({ title, value, note, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wider text-zinc-500">{title}</div>
        <Icon size={19} className="text-red-500" />
      </div>
      <div className="mt-5 text-2xl font-black sm:text-3xl">{value}</div>
      <div className="mt-2 text-xs text-zinc-600">{note}</div>
    </div>
  );
}

export function Progress({ label, value }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="font-bold">{value.toFixed(0)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
        <div
          className="h-full rounded-full bg-red-700 transition-all"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

export function ActionButton({ children, icon: Icon, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
        danger
          ? "border-red-950 text-red-500 hover:bg-red-950"
          : "border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
      }`}
    >
      <Icon size={14} /> {children}
    </button>
  );
}

export function StockForm({ product, onSubmit }) {
  const [qty, setQty] = useState(1);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(product.id, qty);
      }}
    >
      <p className="mb-4 text-sm text-zinc-500">{product.name}</p>
      <label className="text-xs font-semibold text-zinc-400">
        Cantidad recibida
      </label>
      <input
        autoFocus
        min="1"
        type="number"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 outline-none focus:border-red-700"
      />
      <button className="mt-4 w-full rounded-xl bg-red-700 py-3 font-bold hover:bg-red-600">
        Confirmar ingreso
      </button>
    </form>
  );
}

export function RelocateForm({ product, onSubmit }) {
  const [location, setLocation] = useState(product.location);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(product.id, location);
      }}
    >
      <p className="mb-4 text-sm text-zinc-500">
        Ubicación actual:{" "}
        <span className="text-zinc-300">{product.location}</span>
      </p>
      <label className="text-xs font-semibold text-zinc-400">
        Nueva ubicación física
      </label>
      <input
        autoFocus
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Pasillo 4 - Estante A"
        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 outline-none focus:border-red-700"
      />
      <button className="mt-4 w-full rounded-xl bg-red-700 py-3 font-bold hover:bg-red-600">
        Guardar ubicación
      </button>
    </form>
  );
}

export function EditProductForm({ product, onSubmit }) {
  const [form, setForm] = useState({
    name: product.name || "",
    description: product.description || "",
    price: product.price || 0,
    image: product.image || "",
    category: product.category || "Poleras",
    size: product.size || "",
  });

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const price = Number(form.price);
    if (!form.name.trim()) return;
    if (!price || price < 0) return;
    onSubmit(product.id, {
      ...product,
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      image: form.image.trim(),
      category: form.category,
      size: form.size.trim() || "Único",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 flex items-center gap-3">
        <img
          src={form.image}
          alt=""
          className="h-16 w-14 rounded-lg object-cover border border-zinc-800"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/100x125/27272a/9ca3af?text=Sin+imagen";
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{product.name}</p>
          <p className="text-xs text-zinc-600">
            Editando · ID #{product.id}
          </p>
        </div>
      </div>

      <label className="text-xs font-semibold text-zinc-400">Nombre</label>
      <input
        value={form.name}
        onChange={update("name")}
        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-red-700"
      />

      <label className="mt-3 block text-xs font-semibold text-zinc-400">
        Descripción
      </label>
      <textarea
        rows={2}
        value={form.description}
        onChange={update("description")}
        placeholder="Describe el producto..."
        className="mt-2 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-red-700"
      />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-zinc-400">Precio (CLP)</label>
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={update("price")}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-red-700"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-400">Talla</label>
          <input
            value={form.size}
            onChange={update("size")}
            placeholder="M, L, XL..."
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-red-700"
          />
        </div>
      </div>

      <label className="mt-3 block text-xs font-semibold text-zinc-400">
        Categoría
      </label>
      <select
        value={form.category}
        onChange={update("category")}
        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-red-700"
      >
        {["Poleras", "Chaquetas", "Polerones", "Anime", "Accesorios"].map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label className="mt-3 block text-xs font-semibold text-zinc-400">
        URL de imagen
      </label>
      <input
        value={form.image}
        onChange={update("image")}
        placeholder="https://..."
        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-red-700"
      />
      <p className="mt-1 text-[11px] text-zinc-600">
        Pega una URL pública. Se mostrará una vista previa arriba.
      </p>

      <button
        type="submit"
        className="mt-5 w-full rounded-xl bg-red-700 py-3 text-sm font-bold hover:bg-red-600"
      >
        Guardar cambios
      </button>
    </form>
  );
}

export function DamageForm({ product, onSubmit }) {
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("Prenda dañada");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(product.id, qty, reason);
      }}
    >
      <p className="mb-4 text-sm text-zinc-500">
        {product.name}
        <br />
        Valor unitario:{" "}
        <span className="text-zinc-300">{money(product.price)}</span>
      </p>
      <label className="text-xs font-semibold text-zinc-400">
        Unidades a dar de baja
      </label>
      <input
        autoFocus
        min="1"
        max={product.stock}
        type="number"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 outline-none focus:border-red-700"
      />
      <label className="mt-4 block text-xs font-semibold text-zinc-400">
        Motivo
      </label>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 outline-none"
      >
        <option>Prenda dañada</option>
        <option>Defecto de fabricación</option>
        <option>Mancha / deterioro</option>
        <option>Otro</option>
      </select>
      <button className="mt-4 w-full rounded-xl bg-red-700 py-3 font-bold hover:bg-red-600">
        Registrar merma
      </button>
    </form>
  );
}
