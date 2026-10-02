import React from "react";
import { BarChart3, LogOut, CreditCard, AlertTriangle, Users } from "lucide-react";
import { money } from "../data";
import { PageTitle, StatCard, Progress } from "./ui";

export default function AdminView({
  projectedSales,
  losses,
  efficiency,
  users,
  onLogout,
}) {
  return (
    <section>
      <PageTitle
        icon={BarChart3}
        eyebrow="Backoffice"
        title="Finanzas & RRHH"
        subtitle="Vista ejecutiva de ventas proyectadas, mermas y permisos."
      />
      <div className="mb-4 flex justify-end">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-400 hover:border-red-700 hover:text-white"
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Ventas Proyectadas"
          value={money(projectedSales)}
          note="Valor del stock actual"
          icon={CreditCard}
        />
        <StatCard
          title="Pérdidas por Mermas"
          value={money(losses)}
          note="Costo de prendas dadas de baja"
          icon={AlertTriangle}
        />
        <StatCard
          title="Eficiencia Operativa"
          value={`${efficiency.toFixed(1)}%`}
          note="Impacto neto de pérdidas"
          icon={BarChart3}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Resumen operativo</h2>
              <p className="text-xs text-zinc-600">Indicadores del MVP en tiempo real.</p>
            </div>
            <BarChart3 className="text-red-500" />
          </div>
          <div className="space-y-5">
            <Progress label="Eficiencia de inventario" value={efficiency} />
            <Progress label="Nivel de disponibilidad" value={78} />
            <Progress label="Cumplimiento logístico" value={91} />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="mb-5 flex items-center gap-2">
            <Users size={19} className="text-red-500" />
            <div>
              <h2 className="font-bold">Usuarios & Roles</h2>
              <p className="text-xs text-zinc-600">Permisos simulados.</p>
            </div>
          </div>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-3"
              >
                <div className="font-semibold text-sm">{user.name}</div>
                <div className="text-xs text-zinc-600">{user.email}</div>
                <div className="mt-2 inline-flex rounded-full bg-red-950 px-2.5 py-1 text-[10px] font-bold text-red-400">
                  {user.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
