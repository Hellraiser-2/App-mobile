import { Injectable } from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';
import type { LoginRequest, RefreshRequest, Rol, SesionResponse, Usuario } from '@rockstar/contracts';

import { DIAS_REFRESCO, TokensService } from '../auth/tokens.service.js';
import { ErrorDeNegocio, cuerpoComo, sesionInvalida, texto } from '../comun/errores.js';
import { BaseDeDatos, type Ejecutor } from '../db/base-de-datos.js';

interface FilaUsuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  hash_contrasena: string;
}

const SELECCION_USUARIO = `
  SELECT u.id_usuario AS id, u.nombre, u.email, r.nombre AS rol, u.activo, u.hash_contrasena
  FROM usuarios.usuarios u
  JOIN usuarios.roles r USING (id_rol)`;

const credencialesInvalidas = () => new ErrorDeNegocio(401, 'CREDENCIALES_INVALIDAS', 'Correo o contraseña no válidos.');

@Injectable()
export class AuthService {
  /** Hash de una contraseña cualquiera, para gastar el mismo tiempo cuando el correo no existe. */
  private readonly hashDeRelleno = hash('contraseña-inexistente');

  constructor(
    private readonly db: BaseDeDatos,
    private readonly tokens: TokensService,
  ) {}

  async iniciar(cuerpo: unknown): Promise<SesionResponse> {
    const { email, password } = cuerpoComo<LoginRequest>(cuerpo);
    const correo = texto(email).toLowerCase();
    const [cuenta] = await this.db.consultar<FilaUsuario>(`${SELECCION_USUARIO} WHERE u.email = $1`, [correo]);

    // La contraseña se verifica siempre, exista o no la cuenta, para que el tiempo de
    // respuesta no revele qué correos están registrados.
    const coincide = await verify(cuenta?.hash_contrasena ?? (await this.hashDeRelleno), typeof password === 'string' ? password : '');
    if (!cuenta || !coincide || !cuenta.activo) {
      throw credencialesInvalidas();
    }
    return this.emitirSesion(this.db, cuenta);
  }

  /** Cambia un token de refresco vigente por una sesión nueva. El token usado deja de servir. */
  async refrescar(cuerpo: unknown): Promise<SesionResponse> {
    const huella = this.huellaDe(cuerpo);
    return this.db.transaccion(async (tx) => {
      const [sesion] = await tx.consultar<{ id_usuario: number }>(
        `UPDATE usuarios.sesiones SET revocada = true
         WHERE hash_token_refresco = $1 AND NOT revocada AND expira_en > now()
         RETURNING id_usuario`,
        [huella],
      );
      const [cuenta] = sesion
        ? await tx.consultar<FilaUsuario>(`${SELECCION_USUARIO} WHERE u.id_usuario = $1 AND u.activo`, [sesion.id_usuario])
        : [];
      if (!cuenta) {
        throw sesionInvalida();
      }
      return this.emitirSesion(tx, cuenta);
    });
  }

  async cerrar(cuerpo: unknown): Promise<void> {
    await this.db.consultar('UPDATE usuarios.sesiones SET revocada = true WHERE hash_token_refresco = $1', [
      this.huellaDe(cuerpo),
    ]);
  }

  private huellaDe(cuerpo: unknown): string {
    return this.tokens.huella(texto(cuerpoComo<RefreshRequest>(cuerpo).refreshToken));
  }

  private async emitirSesion(ejecutor: Ejecutor, cuenta: FilaUsuario): Promise<SesionResponse> {
    const usuario: Usuario = { id: cuenta.id, nombre: cuenta.nombre, email: cuenta.email, rol: cuenta.rol };
    const refreshToken = this.tokens.nuevoRefresco();
    await ejecutor.consultar(
      `INSERT INTO usuarios.sesiones (id_usuario, hash_token_refresco, expira_en)
       VALUES ($1, $2, now() + make_interval(days => $3))`,
      [usuario.id, this.tokens.huella(refreshToken), DIAS_REFRESCO],
    );
    return { accessToken: this.tokens.emitirAcceso(usuario), refreshToken, usuario };
  }
}
