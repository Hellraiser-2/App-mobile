import { Controller, Get } from '@nestjs/common';
import type { CuentaInterna, Rol } from '@rockstar/contracts';

import { Roles } from '../auth/decoradores.js';
import { BaseDeDatos } from '../db/base-de-datos.js';

@Controller('usuarios')
export class CuentasController {
  constructor(private readonly db: BaseDeDatos) {}

  /** Cuentas del personal, sin las de clientes. */
  @Get('internos')
  @Roles('GERENTE', 'RRHH')
  internos(): Promise<CuentaInterna[]> {
    return this.db.consultar<CuentaInterna>(
      `SELECT u.id_usuario AS id, u.nombre, u.email, r.nombre AS rol, u.activo
       FROM usuarios.usuarios u JOIN usuarios.roles r USING (id_rol)
       WHERE r.nombre <> $1 ORDER BY u.nombre, u.id_usuario`,
      ['CLIENTE' satisfies Rol],
    );
  }
}
