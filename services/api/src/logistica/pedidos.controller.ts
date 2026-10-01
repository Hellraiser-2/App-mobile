import { Controller, Get, Query } from '@nestjs/common';
import type { EstadoPedido, LineaPedido, Pedido } from '@rockstar/contracts';

import { Roles } from '../auth/decoradores.js';
import { BaseDeDatos } from '../db/base-de-datos.js';

interface FilaPedido {
  id_pedido: number;
  id_venta: number;
  estado: EstadoPedido;
  destinatario: string;
  direccion: string;
  comuna: string;
  region: string;
  lineas: LineaPedido[];
  pagado_en: Date;
  despachado_en: Date | null;
  entregado_en: Date | null;
  tracking_starken: string | null;
}

@Controller('logistica')
export class PedidosController {
  constructor(private readonly db: BaseDeDatos) {}

  /** Pedidos del e-commerce tal como los ve el personal, con sus líneas. `estado` limita la lista a uno. */
  @Get('pedidos')
  @Roles('VENDEDOR', 'BODEGA', 'GERENTE')
  async pedidos(@Query('estado') estado?: string): Promise<Pedido[]> {
    const filas = await this.db.consultar<FilaPedido>(
      `SELECT pe.id_pedido, pe.id_venta, es.codigo AS estado, pe.destinatario, pe.direccion,
              co.nombre AS comuna, re.nombre AS region, pe.pagado_en, pe.despachado_en, pe.entregado_en,
              pe.tracking_starken,
              COALESCE((
                SELECT json_agg(json_build_object(
                         'idVariante', v.id_variante, 'sku', v.sku, 'producto', p.nombre,
                         'talla', t.nombre, 'color', c.nombre, 'cantidad', d.cantidad) ORDER BY d.id_detalle)
                FROM ventas.detalle_venta d
                JOIN inventario.variantes v ON v.id_variante = d.id_variante
                JOIN inventario.productos p ON p.id_producto = v.id_producto
                JOIN inventario.tallas t ON t.id_talla = v.id_talla
                JOIN inventario.colores c ON c.id_color = v.id_color
                WHERE d.id_venta = pe.id_venta), '[]'::json) AS lineas
       FROM logistica.pedidos pe
       JOIN logistica.estados_pedido es ON es.id_estado = pe.id_estado
       JOIN logistica.comunas co ON co.id_comuna = pe.id_comuna
       JOIN logistica.regiones re ON re.id_region = co.id_region
       WHERE $1::text IS NULL OR es.codigo = $1
       ORDER BY pe.id_pedido`,
      [typeof estado === 'string' && estado !== '' ? estado : null],
    );
    return filas.map((fila) => ({
      idPedido: fila.id_pedido,
      idVenta: fila.id_venta,
      estado: fila.estado,
      destinatario: fila.destinatario,
      direccion: fila.direccion,
      comuna: fila.comuna,
      region: fila.region,
      lineas: fila.lineas,
      pagadoEn: fila.pagado_en.toISOString(),
      ...(fila.despachado_en ? { despachadoEn: fila.despachado_en.toISOString() } : {}),
      ...(fila.entregado_en ? { entregadoEn: fila.entregado_en.toISOString() } : {}),
      ...(fila.tracking_starken ? { trackingStarken: fila.tracking_starken } : {}),
    }));
  }
}
