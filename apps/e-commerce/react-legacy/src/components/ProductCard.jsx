import React from "react";
import { Plus } from "lucide-react";
import { money } from "../data";

export default function ProductCard({ product, addToCart }) {
  const isAnime = product.category === "Anime";
  return (
    <article
      className={`group overflow-hidden rounded-2xl border transition-colors ${
        isAnime
          ? "border-purple-800/60 bg-gradient-to-b from-zinc-950 via-[#12081a] to-black"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
        <img
          src={product.image}
          alt={product.name}
          className={`h-full w-full object-cover brightness-90 contrast-110 transition duration-500 group-hover:scale-105 ${
            isAnime ? "group-hover:brightness-110" : "grayscale group-hover:grayscale-0"
          }`}
        />
        <div
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
            isAnime
              ? "bg-white/15 text-white"
              : "bg-black/80 text-zinc-300"
          }`}
        >
          {product.category}
        </div>
        {product.stock <= 3 && (
          <div
            className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold ${
              isAnime ? "bg-purple-700 text-white" : "bg-red-700"
            }`}
          >
            Últimas unidades
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="min-h-10 text-sm font-bold leading-5">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-black">{money(product.price)}</span>
          <span className="rounded bg-zinc-900 px-2 py-1 text-[10px] text-zinc-500">
            Talla {product.size}
          </span>
        </div>
        <div className="mt-2 text-xs text-zinc-600">
          Stock disponible: {product.stock}
        </div>
        <button
          disabled={!product.stock}
          onClick={() => addToCart(product)}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40 ${
            isAnime
              ? "border-purple-800 bg-purple-900/40 text-white hover:border-purple-600 hover:bg-purple-700"
              : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-red-700 hover:bg-red-700"
          }`}
        >
          <Plus size={15} /> Agregar al carrito
        </button>
      </div>
    </article>
  );
}
