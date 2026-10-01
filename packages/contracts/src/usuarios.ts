export type Rol = 'CLIENTE' | 'VENDEDOR' | 'BODEGA' | 'GERENTE' | 'RRHH';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
}

/** POST /usuarios/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Respuesta de login y de refresh. */
export interface SesionResponse {
  accessToken: string;
  refreshToken: string;
  usuario: Usuario;
}

/** POST /usuarios/auth/refresh y /logout */
export interface RefreshRequest {
  refreshToken: string;
}
