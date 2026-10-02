import React, { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { adminUsers } from "../data";
import { Modal } from "./ui";

export default function AdminLoginModal({ onClose, onSuccess }) {
  const [username, setUsername] = useState("elias");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const admin = adminUsers.find((u) => u.username === username);
    if (password === "1234" && admin) {
      onSuccess(admin);
    } else {
      setError("Clave de acceso incorrecta.");
    }
  };

  return (
    <Modal title="Acceso restringido · Backoffice" onClose={onClose}>
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-3 grid h-14 w-14 place-items-center rounded-full border border-red-900 bg-red-950/40">
          <ShieldCheck size={28} className="text-red-500" />
        </div>
        <p className="text-xs uppercase tracking-[0.22em] text-red-500">
          Solo personal autorizado
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Este panel es exclusivo para administradores de la tienda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-900 bg-zinc-950/60 p-4">
        <label className="text-xs font-semibold text-zinc-400">Usuario</label>
        <select
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm outline-none focus:border-red-700"
        >
          {adminUsers.map((u) => (
            <option key={u.id} value={u.username}>
              {u.username} · {u.name}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-xs font-semibold text-zinc-400">
          Clave de acceso
        </label>
        <div className="relative mt-2">
          <Lock
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
          />
          <input
            autoFocus
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-3 py-3 text-sm outline-none focus:border-red-700"
          />
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-red-700 py-3 text-sm font-bold hover:bg-red-600"
        >
          Ingresar al panel
        </button>
      </form>

      <p className="mt-4 text-center text-[11px] text-zinc-600">
        Demo MVP · clave de prueba: <span className="text-zinc-400">1234</span>
      </p>
    </Modal>
  );
}
