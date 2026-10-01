import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { SesionGuard } from './auth/sesion.guard.js';
import { TokensService } from './auth/tokens.service.js';
import { FiltroDeErrores } from './comun/filtro-errores.js';
import { DbModule } from './db/db.module.js';
import { InventarioModule } from './inventario/inventario.module.js';
import { PedidosController } from './logistica/pedidos.controller.js';
import { SaludController } from './salud.controller.js';
import { AuthController } from './usuarios/auth.controller.js';
import { AuthService } from './usuarios/auth.service.js';

/**
 * Un solo servicio con los dominios de Usuarios, Inventario y Logística como módulos.
 * Publica las mismas rutas `/api/v1/<dominio>/...` que el diseño reparte entre el
 * gateway y los servicios, de modo que separarlos después no cambia a los clientes.
 */
@Module({
  imports: [DbModule, InventarioModule],
  controllers: [AuthController, PedidosController, SaludController],
  providers: [
    AuthService,
    TokensService,
    { provide: APP_GUARD, useClass: SesionGuard },
    { provide: APP_FILTER, useClass: FiltroDeErrores },
  ],
})
export class AppModule {}
