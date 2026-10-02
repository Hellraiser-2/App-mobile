import React from "react";
import {
  Warehouse,
  Boxes,
  PackagePlus,
  MapPin,
  AlertTriangle,
  ArrowRightLeft,
  Pencil,
} from "lucide-react";
import {
  PageTitle,
  MiniMetric,
  ActionButton,
  Modal,
  StockForm,
  RelocateForm,
  DamageForm,
} from "./ui";

export default function WarehouseView({
  products,
  setStockModal,
  setRelocateModal,
  setDamageModal,
  setEditModal,
}) {
  return (
    <section>
      <PageTitle
        icon={Warehouse}
        eyebrow="Operaciones"
        title="Bodega & Logística"
        subtitle="Control de inventario físico y movimientos de prendas."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniMetric label="SKUs" value={products.length} icon={Boxes} />
        <MiniMetric
          label="Unidades"
          value={products.reduce((s, p) => s + p.stock, 0)}
          icon={PackagePlus}
        />
        <MiniMetric
          label="Ubicaciones"
          value={new Set(products.map((p) => p.location)).size}
          icon={MapPin}
        />
        <MiniMetric
          label="Bajo stock"
          value={products.filter((p) => p.stock <= 3).length}
          icon={AlertTriangle}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-5 py-4">Producto</th>
                <th className="px-5 py-4">Talla</th>
                <th className="px-5 py-4">Cantidad</th>
                <th className="px-5 py-4">Ubicación física</th>
                <th className="px-5 py-4">Operaciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/40"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        className="h-12 w-10 rounded-lg object-cover grayscale"
                      />
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-zinc-600">{p.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-zinc-400">{p.size}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`font-black ${p.stock <= 3 ? "text-red-500" : ""}`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-zinc-400">
                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-red-500" />
                      {p.location}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <ActionButton
                        icon={Pencil}
                        onClick={() => setEditModal(p)}
                      >
                        Editar
                      </ActionButton>
                      <ActionButton
                        icon={PackagePlus}
                        onClick={() => setStockModal(p)}
                      >
                        Ingreso
                      </ActionButton>
                      <ActionButton
                        icon={ArrowRightLeft}
                        onClick={() => setRelocateModal(p)}
                      >
                        Mover
                      </ActionButton>
                      <ActionButton
                        danger
                        icon={AlertTriangle}
                        onClick={() => setDamageModal(p)}
                      >
                        Merma
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
