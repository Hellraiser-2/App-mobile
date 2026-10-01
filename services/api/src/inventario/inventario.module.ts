import { Module } from '@nestjs/common';

import { BusquedasService } from './busquedas.service.js';
import { CatalogosService } from './catalogos.service.js';
import { InventarioController } from './inventario.controller.js';
import { MovimientosService } from './movimientos.service.js';
import { ProductosService } from './productos.service.js';
import { StockService } from './stock.service.js';

@Module({
  controllers: [InventarioController],
  providers: [BusquedasService, CatalogosService, MovimientosService, ProductosService, StockService],
})
export class InventarioModule {}
