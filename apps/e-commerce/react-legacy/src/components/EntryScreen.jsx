import React from "react";
import { ShieldCheck } from "lucide-react";

export default function EntryScreen({ onLogin, onGuest, onAdminLogin }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-950 via-[#120809] to-black p-8 text-center">
        <div className="mb-8 flex justify-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-red-700 shadow-lg shadow-red-950/50">
            <span className="text-3xl">♠</span>
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-black uppercase tracking-[0.18em]">
          Rockstar e-commerce
        </h1>
        <p className="mb-8 text-sm text-zinc-500">
          Rock · Metal · Underground
        </p>
        <p className="mb-6 text-sm text-zinc-400">
          ¿Deseas iniciar sesión o continuar como invitado?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onLogin}
            className="rounded-xl bg-red-700 py-3 font-bold text-white hover:bg-red-600"
          >
            Iniciar sesión
          </button>
          <button
            onClick={onGuest}
            className="rounded-xl border border-zinc-800 bg-zinc-900 py-3 font-bold text-zinc-400 hover:text-white"
          >
            Continuar como invitado
          </button>
        </div>

        <div className="mt-6 border-t border-zinc-900 pt-5">
          <button
            onClick={onAdminLogin}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 transition hover:text-red-500"
          >
            <ShieldCheck size={14} />
            Acceso administrador
          </button>
        </div>
      </div>
    </div>
  );
}
