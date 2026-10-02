import { Injectable } from '@nestjs/common';
import type { ProductoEdicionRequest, ProductoNuevoRequest, Usuario, VarianteGestion, VarianteStock } from '@rockstar/contracts';

import { ErrorDeNegocio, cuerpoComo, esEnteroPositivo, exigir, noEncontrado, texto } from '../comun/errores.js';
import { claveDe } from '../comun/texto.js';
import { BaseDeDatos, type Ejecutor } from '../db/base-de-datos.js';
import { CatalogosService } from './catalogos.service.js';
import { variantesDeGestion } from './consultas.js';
import { StockService } from './stock.service.js';
import { codigoDeUbicacion, codigosDeVariante, esUbicacion } from './ubicaciones.js';

interface ProductoExistente {
  id: number;
  categoria: string;
}

/** Alta de productos desde la bodega: crea la variante y registra el ingreso de sus primeras unidades. */
@Injectable()
export class ProductosService {
  constructor(
    private readonly db: BaseDeDatos,
    private readonly catalogos: CatalogosService,
    private readonly stock: StockService,
  ) {}

  /**
   * Cambia el precio o la descripción de un producto; solo los campos que vienen en el
   * cuerpo. Sin precio, el producto deja de ofrecerse en la tienda web.
   */
  async editar(idProducto: number, cuerpo: unknown): Promise<VarianteGestion[]> {
    const datos = cuerpoComo<ProductoEdicionRequest>(cuerpo);
    const valores: unknown[] = [idProducto];
    const cambios: string[] = [];
    if (datos.precio !== undefined) {
      exigir(datos.precio === null || esEnteroPositivo(datos.precio), 'El precio debe ser un entero mayor que cero.');
      valores.push(datos.precio);
      cambios.push(`precio = $${valores.length}`);
    }
    if (datos.descripcion !== undefined) {
      exigir(datos.descripcion === null || typeof datos.descripcion === 'string', 'La descripción no es válida.');
      valores.push(texto(datos.descripcion) || null);
      cambios.push(`descripcion = $${valores.length}`);
    }
    exigir(cambios.length > 0, 'No hay cambios que aplicar.');

    const [producto] = await this.db.consultar(
      `UPDATE inventario.productos SET ${cambios.join(', ')} WHERE id_producto = $1 RETURNING id_producto`,
      valores,
    );
    if (!producto) {
      throw noEncontrado('El producto no existe.');
    }
    return variantesDeGestion(this.db, 'WHERE p.id_producto = $1', [idProducto]);
  }

  crear(cuerpo: unknown, usuario: Usuario): Promise<VarianteStock> {
    const datos = cuerpoComo<ProductoNuevoRequest>(cuerpo);
    return this.stock.unaVez(
      'PRODUCTO',
      datos.claveIdempotencia,
      usuario,
      (tx, clave) => this.crearVariante(tx, clave, datos, usuario),
      (tx, clave) => this.stock.varianteDeOperacion(tx, clave),
    );
  }

  private async crearVariante(tx: Ejecutor, clave: string, datos: Partial<ProductoNuevoRequest>, usuario: Usuario): Promise<void> {
    const nombre = texto(datos.nombre);
    const talla = texto(datos.talla);
    const color = texto(datos.color);
    const { cantidad, ubicacion } = datos;
    exigir(nombre !== '', 'El nombre es obligatorio.');
    exigir(texto(datos.categoria) !== '', 'La categoría es obligatoria.');
    exigir(talla !== '', 'La talla es obligatoria.');
    exigir(color !== '', 'El color es obligatorio.');
    exigir(texto(datos.imagen).startsWith('data:image/'), 'La imagen es obligatoria.');
    exigir(esEnteroPositivo(cantidad), 'La cantidad debe ser un entero mayor que cero.');
    exigir(esUbicacion(ubicacion), 'La ubicación no es válida.');

    // Dos altas simultáneas del mismo producto se hacen de a una, para no crearlo dos veces.
    const claveProducto = claveDe(nombre);
    await tx.consultar('SELECT pg_advisory_xact_lock(hashtext($1))', [`producto:${claveProducto}`]);
    const [existente] = await tx.consultar<ProductoExistente>(
      `SELECT p.id_producto AS id, c.nombre AS categoria
       FROM inventario.productos p JOIN inventario.categorias c ON c.id_categoria = p.id_categoria
       WHERE p.clave = $1`,
      [claveProducto],
    );

    // Una talla o color nuevo de un producto existente hereda su categoría, banda, foto y ubicación.
    // Una categoría, talla, color o banda que aún no existe queda registrada al crear el producto.
    const categoria = await this.catalogos.incorporarCategoria(tx, existente?.categoria ?? datos.categoria);
    const idTalla = (await this.catalogos.incorporar(tx, 'tallas', talla)).id;
    const idColor = (await this.catalogos.incorporar(tx, 'colores', color)).id;
    await this.catalogos.admitirTalla(tx, categoria.id, idTalla);

    let idProducto = existente?.id;
    if (idProducto === undefined) {
      // Las categorías sin banda, como los pantalones, ignoran la banda que se envíe.
      const idBanda = categoria.usaBanda && texto(datos.banda) !== '' ? (await this.catalogos.incorporar(tx, 'bandas', datos.banda)).id : null;
      // La posición en la bodega es correlativa dentro de la zona de la categoría.
      const [lugar] = await tx.consultar<{ zona: string; posicion: number }>(
        `UPDATE inventario.categorias SET ultima_posicion = ultima_posicion + 1
         WHERE id_categoria = $1 RETURNING zona, ultima_posicion AS posicion`,
        [categoria.id],
      );
      const [producto] = await tx.consultar<{ id: number }>(
        `INSERT INTO inventario.productos (id_categoria, id_banda, codigo_ubicacion, nombre, clave, imagen_url)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_producto AS id`,
        [categoria.id, idBanda, codigoDeUbicacion(lugar!.zona, lugar!.posicion), nombre, claveProducto, datos.imagen],
      );
      idProducto = producto!.id;
    } else {
      const [duplicada] = await tx.consultar(
        'SELECT 1 FROM inventario.variantes WHERE id_producto = $1 AND id_talla = $2 AND id_color = $3',
        [idProducto, idTalla, idColor],
      );
      if (duplicada) {
        throw new ErrorDeNegocio(409, 'VARIANTE_DUPLICADA', 'La variante ya existe.');
      }
    }

    // El SKU y el código escaneable se derivan del identificador, así que se pide antes de insertar.
    const [siguiente] = await tx.consultar<{ id: number }>(
      `SELECT nextval(pg_get_serial_sequence('inventario.variantes', 'id_variante'))::int AS id`,
    );
    const idVariante = siguiente!.id;
    const { sku, codigo } = codigosDeVariante(idVariante);
    await tx.consultar(
      'INSERT INTO inventario.variantes (id_variante, id_producto, id_talla, id_color, sku, codigo) VALUES ($1, $2, $3, $4, $5, $6)',
      [idVariante, idProducto, idTalla, idColor, sku, codigo],
    );

    // Las primeras unidades entran como un ingreso, para que el stock siempre tenga su movimiento.
    await this.stock.bloquear(tx, [idVariante]);
    await this.stock.sumar(tx, idVariante, ubicacion, cantidad);
    await this.stock.registrar(tx, clave, usuario, {
      idVariante,
      tipo: 'INGRESO',
      ubicacion,
      cantidad,
      motivo: 'Ingreso inicial del producto',
    });
  }
}
