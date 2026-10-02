import React from "react";
import {
  ShoppingCart,
  Warehouse,
  BarChart3,
} from "lucide-react";

function NavButton({ id, icon: Icon, children, view, setView }) {
  return (
    <button
      onClick={() => setView(id)}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        view === id
          ? "bg-red-700 text-white shadow-lg shadow-red-950/40"
          : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
      }`}
    >
      <Icon size={18} />
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
}

export default function Header({
  view,
  setView,
  isAdmin,
  user,
  isLoggedIn,
  cartCount,
  onCartOpen,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <button onClick={() => setView("shop")} className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-red-700 shadow-lg shadow-red-950/50">
            <span className="text-xl">♠</span>
          </div>
          <div className="text-left">
            <div className="font-black tracking-[0.18em]">Rockstar e-commerce</div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              ROCK · METAL · UNDERGROUND
            </div>
          </div>
        </button>

        <nav className="flex items-center gap-1 rounded-2xl border border-zinc-800 bg-zinc-950 p-1">
          <NavButton id="shop" icon={ShoppingCart} view={view} setView={setView}>
            Tienda
          </NavButton>
          {isAdmin && (
            <NavButton id="warehouse" icon={Warehouse} view={view} setView={setView}>
              Bodega
            </NavButton>
          )}
          {isAdmin && (
            <NavButton id="admin" icon={BarChart3} view={view} setView={setView}>
              Finanzas & RRHH
            </NavButton>
          )}
        </nav>

        {(isLoggedIn || isAdmin) && user && (
          <div className="flex items-center gap-2 text-sm">
            <div className={`h-2 w-2 rounded-full ${isAdmin ? "bg-red-500" : "bg-zinc-500"}`} />
            <span className="font-medium">{user.name}</span>
          </div>
        )}

        <button
          onClick={onCartOpen}
          className="relative rounded-xl border border-zinc-800 p-2.5 hover:border-red-800 hover:bg-zinc-900"
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
