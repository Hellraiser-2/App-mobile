export type EstadoPedido =
  | 'PAGADO'
  | 'EN_PREPARACION'
  | 'DESPACHO_PENDIENTE'
  | 'ATENCION_MANUAL'
  | 'DESPACHADO'
  | 'ENTREGADO';

export interface LineaPedido {
  idVariante: number;
  sku: string;
  producto: string;
  talla: string;
  color: string;
  cantidad: number;
}

/** Pedido del e-commerce tal como lo ve el personal. GET /logistica/pedidos */
export interface Pedido {
  idPedido: number;
  idVenta: number;
  estado: EstadoPedido;
  destinatario: string;
  direccion: string;
  comuna: string;
  region: string;
  lineas: LineaPedido[];
  pagadoEn: string;
  despachadoEn?: string;
  entregadoEn?: string;
  /** Número de seguimiento de Starken; existe desde que se emite el despacho. */
  trackingStarken?: string;
}
