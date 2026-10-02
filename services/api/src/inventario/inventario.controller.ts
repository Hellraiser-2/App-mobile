import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import type {
  ArticuloCatalogo,
  Busqueda,
  Categoria,
  Movimiento,
  ResultadoMovimientos,
  Usuario,
  VarianteGestion,
  VarianteStock,
} from '@rockstar/contracts';

import { Publica, Roles, UsuarioActual } from '../auth/decoradores.js';
import { noEncontrado } from '../comun/errores.js';
import { patronLike } from '../comun/texto.js';
import { BaseDeDatos } from '../db/base-de-datos.js';
import { BusquedasService } from './busquedas.service.js';
import { CatalogosService } from './catalogos.service.js';
import { articulosDeCatalogo, historialDeMovimientos, variantesConStock, variantesDeGestion } from './consultas.js';
import { MovimientosService } from './movimientos.service.js';
import { ProductosService } from './productos.service.js';

/**
 * Rutas de Inventario. Los roles de cada una siguen la matriz de permisos del diseño:
 * consultar stock es de Vendedor, Bodega y Gerente; ingresos y mermas, solo de Bodega.
 */
@Controller('inventario')
export class InventarioController {
  constructor(
    private readonly db: BaseDeDatos,
    private readonly catalogos: CatalogosService,
    private readonly productos: ProductosService,
    private readonly movimientos: MovimientosService,
    private readonly busquedas: BusquedasService,
  ) {}

  // --- Tienda web ---

  /** Lo que la tienda ofrece a cualquier visitante: prendas con precio y su disponibilidad al instante. */
  @Get('catalogo')
  @Publica()
  catalogo(): Promise<ArticuloCatalogo[]> {
    return articulosDeCatalogo(this.db);
  }

  // --- Consulta de stock ---

  /**
   * Búsqueda por SKU, producto, categoría, banda o código del espacio de bodega.
   * Sin texto, lista todas las variantes con su stock.
   */
  @Get('variantes')
  @Roles('VENDEDOR', 'BODEGA', 'GERENTE')
  buscarVariantes(@Query('q') q?: string): Promise<VarianteStock[]> {
    const consulta = typeof q === 'string' ? q.trim() : '';
    if (consulta === '') {
      return variantesConStock(this.db);
    }
    return variantesConStock(
      this.db,
      `WHERE v.sku ILIKE $1 ESCAPE '\\' OR p.nombre ILIKE $1 ESCAPE '\\'
          OR c.nombre ILIKE $1 ESCAPE '\\' OR b.nombre ILIKE $1 ESCAPE '\\'
          OR p.codigo_ubicacion ILIKE $1 ESCAPE '\\'`,
      [patronLike(consulta)],
    );
  }

  /** Búsqueda por escaneo: acepta el código de la etiqueta o el SKU. */
  @Get('variantes/por-codigo/:codigo')
  @Roles('VENDEDOR', 'BODEGA', 'GERENTE')
  async variantePorCodigo(@Param('codigo') codigo: string): Promise<VarianteStock> {
    const [variante] = await variantesConStock(this.db, 'WHERE v.codigo = $1 OR v.sku = $1', [codigo]);
    if (!variante) {
      throw noEncontrado('El código no está registrado.');
    }
    return variante;
  }

  // --- Catálogos ---

  @Get('bandas')
  @Roles('BODEGA', 'GERENTE')
  bandas(): Promise<string[]> {
    return this.catalogos.listar('bandas');
  }

  @Post('bandas')
  @Roles('BODEGA', 'GERENTE')
  crearBanda(@Body('nombre') nombre: unknown): Promise<string[]> {
    return this.catalogos.agregar('bandas', nombre);
  }

  @Get('colores')
  @Roles('BODEGA', 'GERENTE')
  colores(): Promise<string[]> {
    return this.catalogos.listar('colores');
  }

  @Post('colores')
  @Roles('BODEGA', 'GERENTE')
  crearColor(@Body('nombre') nombre: unknown): Promise<string[]> {
    return this.catalogos.agregar('colores', nombre);
  }

  @Get('categorias')
  @Roles('BODEGA', 'GERENTE')
  categorias(): Promise<Categoria[]> {
    return this.catalogos.listarCategorias();
  }

  @Post('categorias')
  @Roles('BODEGA', 'GERENTE')
  crearCategoria(@Body('nombre') nombre: unknown): Promise<Categoria[]> {
    return this.catalogos.agregarCategoria(nombre);
  }

  // --- Productos y movimientos ---

  @Post('productos')
  @Roles('BODEGA', 'GERENTE')
  crearProducto(@Body() cuerpo: unknown, @UsuarioActual() usuario: Usuario): Promise<VarianteStock> {
    return this.productos.crear(cuerpo, usuario);
  }

  /** Todas las variantes con el precio y la descripción de su producto, tengan precio o no. */
  @Get('productos')
  @Roles('VENDEDOR', 'BODEGA', 'GERENTE')
  productosDeGestion(): Promise<VarianteGestion[]> {
    return variantesDeGestion(this.db);
  }

  /** El precio lo define el Gerente (matriz de permisos del diseño). */
  @Patch('productos/:id')
  @Roles('GERENTE')
  editarProducto(@Param('id', ParseIntPipe) id: number, @Body() cuerpo: unknown): Promise<VarianteGestion[]> {
    return this.productos.editar(id, cuerpo);
  }

  /** Historial de movimientos, del más reciente al más antiguo. `tipo` lo limita, por ejemplo a `MERMA`. */
  @Get('movimientos')
  @Roles('BODEGA', 'GERENTE')
  historial(@Query('tipo') tipo?: string): Promise<Movimiento[]> {
    return historialDeMovimientos(this.db, typeof tipo === 'string' && tipo !== '' ? tipo : null);
  }

  @Post('movimientos/ingresos')
  @Roles('BODEGA')
  ingreso(@Body() cuerpo: unknown, @UsuarioActual() usuario: Usuario): Promise<ResultadoMovimientos> {
    return this.movimientos.ingreso(cuerpo, usuario);
  }

  @Post('movimientos/mermas')
  @Roles('BODEGA')
  merma(@Body() cuerpo: unknown, @UsuarioActual() usuario: Usuario): Promise<ResultadoMovimientos> {
    return this.movimientos.merma(cuerpo, usuario);
  }

  @Post('movimientos/traspasos')
  @Roles('VENDEDOR', 'BODEGA')
  traspaso(@Body() cuerpo: unknown, @UsuarioActual() usuario: Usuario): Promise<ResultadoMovimientos> {
    return this.movimientos.traspaso(cuerpo, usuario);
  }

  @Post('movimientos/ajustes')
  @Roles('VENDEDOR', 'BODEGA')
  ajuste(@Body() cuerpo: unknown, @UsuarioActual() usuario: Usuario): Promise<ResultadoMovimientos> {
    return this.movimientos.ajuste(cuerpo, usuario);
  }

  // --- Tiempo de búsqueda ---

  @Post('busquedas')
  @Roles('VENDEDOR', 'BODEGA')
  iniciarBusqueda(@Body() cuerpo: unknown, @UsuarioActual() usuario: Usuario): Promise<Busqueda> {
    return this.busquedas.iniciar(cuerpo, usuario);
  }

  @Patch('busquedas/:id')
  @Roles('VENDEDOR', 'BODEGA')
  cerrarBusqueda(@Param('id', ParseIntPipe) id: number, @Body() cuerpo: unknown): Promise<Busqueda> {
    return this.busquedas.cerrar(id, cuerpo);
  }
}
