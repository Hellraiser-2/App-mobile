import React from "react";
import { X, Plus, Minus, Trash2, ShoppingCart, CreditCard } from "lucide-react";
import { money } from "../data";

export default function CartSidebar({
  cart,
  changeQty,
  subtotal,
  total,
  shipping,
  setShipping,
  shippingCost,
  checkout,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950 p-5 shadow-2xl overflow-y-auto">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">Tu carrito</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900 hover:text-white"
          >
            <X size={18} />
          </button>
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
                  <div className="truncate text-xs font-semibold">
                    {item.name}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {money(item.price)}
                  </div>
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
      </div>
    </div>
  );
}
