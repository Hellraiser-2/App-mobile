import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import type { CheckoutResponse, ResultadoPago, Usuario } from '@rockstar/contracts';

import { Publica, Roles, UsuarioActual } from '../auth/decoradores.js';
import { ComprasService } from './compras.service.js';

/**
 * Compra web. En el diseño el checkout es de Ventas y el retorno del pago es de Pagos;
 * aquí comparten controlador porque en este servicio único los resuelve la misma saga.
 */
@Controller()
export class VentasController {
  constructor(private readonly compras: ComprasService) {}

  /** Crea la compra, reserva las unidades e inicia el pago. Exige sesión de Cliente. */
  @Post('ventas/checkout')
  @Roles('CLIENTE')
  checkout(@Body() cuerpo: unknown, @UsuarioActual() cliente: Usuario): Promise<CheckoutResponse> {
    return this.compras.iniciar(cuerpo, cliente);
  }

  /**
   * Retorno desde la pasarela. Es público porque quien llega es el navegador redirigido,
   * y lo que identifica el pago es su token.
   */
  @Post('pagos/webpay/retorno')
  @Publica()
  @HttpCode(200)
  retorno(@Body() cuerpo: unknown): Promise<ResultadoPago> {
    return this.compras.resolverPago(cuerpo);
  }
}
