# Rockstar

Plataforma de inventario para una tienda de ropa: app de bodega, backend y base de datos.

| Pieza | Carpeta | Tecnología |
|---|---|---|
| App de bodega | `apps/bodega-mobile` | Ionic Angular + Capacitor |
| Backend | `services/api` | NestJS |
| Base de datos | `db/migrations` | PostgreSQL |
| Contratos de la API | `packages/contracts` | Tipos de TypeScript compartidos |

El diseño completo y el plan de trabajo están en `openspec/changes/plataforma-omnicanal-mvp/`.

## Levantar todo con Docker

Cada pieza corre en su propio contenedor.

```
docker compose up --build
```

| Contenedor | Qué es | Dirección |
|---|---|---|
| `app` | App de bodega servida por nginx | http://localhost:8080 |
| `api` | Backend | http://localhost:3000/api/v1 |
| `db` | PostgreSQL | `localhost:5432`, solo desde este equipo |

Al arrancar, el backend crea las tablas y, si la base está vacía, carga datos de demostración.

| Cuenta | Contraseña | Rol |
|---|---|---|
| `bodega@rockstar.cl` | `bodega123` | Bodega. Es la única que entra a la app de bodega |
| `vendedor@rockstar.cl` | `vendedor123` | Vendedor |
| `gerente@rockstar.cl` | `gerente123` | Gerente |

Otros comandos:

```
docker compose down              # detiene y conserva los datos
docker compose down --volumes    # detiene y borra la base y las claves
docker compose logs -f api       # registro del backend
```

Para cambiar contraseñas o puertos, copia `.env.example` a `.env`.

### Si Docker Desktop no arranca en Windows

Docker necesita la característica "Plataforma de máquina virtual" de Windows. Si Docker Desktop avisa que no hay virtualización, abre PowerShell **como administrador**, ejecuta lo siguiente y reinicia el equipo:

```
wsl --install
```

Si después del reinicio el aviso sigue, hay que activar la virtualización (Intel VT-x o AMD-V) en la BIOS del equipo.

## Trabajar sin Docker

Se necesita Node.js 22 o superior, y `npm install` en la raíz.

**Backend con base en memoria.** Levanta la API en http://localhost:3000 con un PostgreSQL embebido. No requiere instalar nada más, y los datos se pierden al cerrar.

```
cd services/api
npm run local
```

**Backend contra un PostgreSQL propio.**

```
cd services/api
npm run build
$env:DATABASE_URL = "postgres://usuario:clave@localhost:5432/rockstar"   # PowerShell
$env:SEMBRAR_DEMO = "true"
npm start
```

**App.** Por defecto usa un backend simulado en memoria, de modo que funciona sola.

```
cd apps/bodega-mobile
npm start
```

Para que use la API real, cambia `useMockApi` a `false` y ajusta `apiUrl` en `src/environments/environment.ts`. En un teléfono, `apiUrl` debe llevar la IP del equipo donde corre el backend, no `localhost`.

## Pruebas

```
cd apps/bodega-mobile
npm test -- --watch=false     # pruebas de la app
npm run lint

cd services/api
npm test                      # pruebas unitarias
npm run test:e2e              # pruebas del contrato de la API, con base en memoria
```

Las pruebas de contrato también pueden correr contra los contenedores:

```
$env:API_URL = "http://localhost:3000/api/v1"
npm run test:e2e
```

## Variables del backend

| Variable | Uso | Por defecto |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL. Obligatoria | |
| `PUERTO` | Puerto en que escucha | `3000` |
| `SEMBRAR_DEMO` | Carga los datos de demostración si la base está vacía | `false` |
| `CORS_ORIGENES` | Orígenes permitidos, separados por coma. Vacío acepta cualquiera | vacío |
| `JWT_CLAVES_DIR` | Carpeta del par de claves que firma los tokens. Se genera si no existe | `claves` |
| `JWT_CLAVE_PRIVADA`, `JWT_CLAVE_PUBLICA` | Claves en formato PEM, en lugar de la carpeta | |
| `DB_POOL_MAX` | Conexiones simultáneas a la base | `10` |
| `MIGRACIONES_DIR` | Carpeta de migraciones | `db/migrations` |

Las cuentas de demostración tienen contraseñas públicas. Fuera de desarrollo, usa `SEMBRAR_DEMO=false`.
