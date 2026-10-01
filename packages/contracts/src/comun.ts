/** Formato de error común a todos los servicios. */
export interface ErrorApi {
  codigo: CodigoError | string;
  mensaje: string;
  detalle?: unknown;
}

export type CodigoError =
  | 'CREDENCIALES_INVALIDAS'
  | 'SESION_INVALIDA'
  | 'ACCESO_DENEGADO'
  | 'NO_ENCONTRADO'
  | 'DATOS_INVALIDOS'
  | 'STOCK_INSUFICIENTE'
  | 'UNIDADES_RESERVADAS'
  | 'VARIANTE_INACTIVA'
  | 'VARIANTE_DUPLICADA';
