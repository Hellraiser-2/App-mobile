import React from "react";
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard } from "lucide-react";
import { money } from "../data";
import ProductCard from "./ProductCard";

export default function ShopView({
  products,
  search,
  setSearch,
  category,
  setCategory,
  addToCart,
  cart,
  changeQty,
  subtotal,
  total,
  shipping,
  setShipping,
  shippingCost,
  checkout,
}) {
  return (
    <section>
      <div className="relative mb-7 overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-[#120809] to-black p-7 sm:p-10">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-red-900/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-red-500">
            Nueva colección · 2026
          </div>
          <h1 className="text-4xl font-black uppercase leading-none sm:text-6xl">
            Viste el <span className="text-red-600">ruido.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">
            Poleras, chaquetas y polerones para quienes prefieren guitarras
            pesadas, amplificadores al máximo y cero compromisos.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 sm:max-w-md">
          <Search size={18} className="text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar prendas..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["Todos", "Poleras", "Chaquetas", "Polerones", "Anime", "Accesorios"].map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm ${
                category === item
                  ? "border-red-700 bg-red-700 text-white"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-950 p-5 lg:sticky lg:top-24">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Tu carrito</h2>
            <ShoppingCart size={19} className="text-red-500" />
          </div>

          {cart.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-600">
              Tu carrito está vacío.
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 border-b border-zinc-900 pb-4"
                >
                  <img
                    src={item.image}
                    className="h-16 w-14 rounded-lg object-cover grayscale"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold">{item.name}</div>
                    <div className="mt-1 text-xs text-zinc-500">{money(item.price)}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => changeQty(item.id, -1)}
                        className="rounded bg-zinc-900 p-1"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-4 text-center text-xs">{item.qty}</span>
                      <button
                        onClick={() => changeQty(item.id, 1)}
                        className="rounded bg-zinc-900 p-1"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => changeQty(item.id, -item.qty)}
                        className="ml-auto text-zinc-600 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Envío · Simulación Starken
                </label>
                <select
                  value={shipping}
                  onChange={(e) => setShipping(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm outline-none"
                >
                  <option value="santiago">
                    Despacho Santiago · {money(3990)}
                  </option>
                  <option value="regiones">
                    Despacho Regiones · {money(7990)}
                  </option>
                </select>
              </div>

              <div className="space-y-2 border-t border-zinc-800 pt-4 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Despacho</span>
                  <span>{money(shippingCost)}</span>
                </div>
                <div className="flex justify-between pt-2 text-lg font-black">
                  <span>Total</span>
                  <span className="text-red-500">{money(total)}</span>
                </div>
              </div>

              <button
                onClick={checkout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 py-3 font-bold hover:bg-red-600"
              >
                <CreditCard size={18} />
                Finalizar Compra
              </button>
              <p className="text-center text-[11px] text-zinc-600">
                Demo MVP · no se realiza un cobro real.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
