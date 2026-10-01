import type { Movimiento, TipoMerma, TipoMovimiento, Ubicacion, VarianteStock } from '@rockstar/contracts';

import type { Ejecutor } from '../db/base-de-datos.js';
import { ID_UBICACION } from './ubicaciones.js';

/**
 * Una reserva compromete unidades mientras está confirmada (compra pagada sin despachar)
 * o mientras está activa y no ha vencido (pago en curso).
 */
export const RESERVA_VIGENTE = `(r.estado = 'CONFIRMADA' OR (r.estado = 'ACTIVA' AND r.expira_en > now()))`;

interface FilaVariante {
  id_variante: number;
  sku: string;
  codigo: string;
  producto: string;
  categoria: string;
  banda: string | null;
  imagen_url: string | null;
  codigo_ubicacion: string;
  talla: string;
  color: string;
  activo: boolean;
  bodega: number;
  sala: number;
  reservado: number;
}

const SELECCION_VARIANTE = `
  SELECT v.id_variante, v.sku, v.codigo, p.nombre AS producto, c.nombre AS categoria, b.nombre AS banda,
         p.imagen_url, p.codigo_ubicacion, t.nombre AS talla, co.nombre AS color,
         (v.activo AND p.activo) AS activo,
         COALESCE((SELECT e.cantidad FROM inventario.existencias e
                   WHERE e.id_variante = v.id_variante AND e.id_ubicacion = ${ID_UBICACION.BODEGA}), 0) AS bodega,
         COALESCE((SELECT e.cantidad FROM inventario.existencias e
                   WHERE e.id_variante = v.id_variante AND e.id_ubicacion = ${ID_UBICACION.SALA_VENTAS}), 0) AS sala,
         COALESCE((SELECT sum(r.cantidad) FROM inventario.reservas r
                   WHERE r.id_variante = v.id_variante AND ${RESERVA_VIGENTE}), 0)::int AS reservado
  FROM inventario.variantes v
  JOIN inventario.productos p ON p.id_producto = v.id_producto
  JOIN inventario.categorias c ON c.id_categoria = p.id_categoria
  LEFT JOIN inventario.bandas b ON b.id_banda = p.id_banda
  JOIN inventario.tallas t ON t.id_talla = v.id_talla
  JOIN inventario.colores co ON co.id_color = v.id_color`;

function aVarianteStock(fila: FilaVariante): VarianteStock {
  return {
    idVariante: fila.id_variante,
    sku: fila.sku,
    codigo: fila.codigo,
    producto: fila.producto,
    categoria: fila.categoria,
    banda: fila.banda,
    imagenUrl: fila.imagen_url,
    codigoUbicacion: fila.codigo_ubicacion,
    talla: fila.talla,
    color: fila.color,
    activo: fila.activo,
    existencias: [
      { ubicacion: 'BODEGA', cantidad: fila.bodega },
      { ubicacion: 'SALA_VENTAS', cantidad: fila.sala },
    ],
    reservado: fila.reservado,
    disponible: fila.bodega + fila.sala - fila.reservado,
  };
}

/**
 * Variantes con su stock, ordenadas por identificador. `condicion` es un `WHERE` sobre
 * los alias de la selección (`v`, `p`, `c`, `b`, `t`, `co`) con sus parámetros.
 */
export async function variantesConStock(ejecutor: Ejecutor, condicion = '', parametros: unknown[] = []): Promise<VarianteStock[]> {
  const filas = await ejecutor.consultar<FilaVariante>(`${SELECCION_VARIANTE} ${condicion} ORDER BY v.id_variante`, parametros);
  return filas.map(aVarianteStock);
}

interface FilaMovimiento {
  id_movimiento: number;
  id_variante: number;
  tipo: TipoMovimiento;
  tipo_merma: TipoMerma | null;
  ubicacion: Ubicacion;
  ubicacion_destino: Ubicacion | null;
  cantidad: number;
  fecha: Date;
  id_usuario: number;
  motivo: string;
}

/** Movimientos que registró una operación, en el orden en que se registraron. */
export async function movimientosDeOperacion(ejecutor: Ejecutor, claveIdempotencia: string): Promise<Movimiento[]> {
  const filas = await ejecutor.consultar<FilaMovimiento>(
    `SELECT m.id_movimiento, m.id_variante, tm.codigo AS tipo, tme.codigo AS tipo_merma, u.nombre AS ubicacion,
            ud.nombre AS ubicacion_destino, m.cantidad, m.fecha, m.id_usuario, m.motivo
     FROM inventario.movimientos m
     JOIN inventario.tipos_movimiento tm ON tm.id_tipo = m.id_tipo
     LEFT JOIN inventario.tipos_merma tme ON tme.id_tipo_merma = m.id_tipo_merma
     JOIN inventario.ubicaciones u ON u.id_ubicacion = m.id_ubicacion
     LEFT JOIN inventario.ubicaciones ud ON ud.id_ubicacion = m.id_ubicacion_destino
     WHERE m.clave_idempotencia = $1
     ORDER BY m.id_movimiento`,
    [claveIdempotencia],
  );
  return filas.map((fila) => ({
    idMovimiento: fila.id_movimiento,
    idVariante: fila.id_variante,
    tipo: fila.tipo,
    ...(fila.tipo_merma ? { tipoMerma: fila.tipo_merma } : {}),
    ubicacion: fila.ubicacion,
    ...(fila.ubicacion_destino ? { ubicacionDestino: fila.ubicacion_destino } : {}),
    cantidad: fila.cantidad,
    fecha: fila.fecha.toISOString(),
    idUsuario: fila.id_usuario,
    motivo: fila.motivo,
  }));
}
