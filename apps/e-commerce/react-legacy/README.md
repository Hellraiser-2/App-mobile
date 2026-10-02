# Cuervo Negro · Rockstar e-commerce

MVP de tienda online de ropa Rock & Metal. React + Vite + Tailwind.

## Levantar con Docker (recomendado para demo al equipo)

```bash
# Construir la imagen
docker build -t cuervo-negro .

# Correr el contenedor
docker run --rm -p 8080:80 cuervo-negro
```

Abrir en el navegador: <http://localhost:8080>

> Si otro servicio ya usa el 8080, cambia el puerto: `docker run --rm -p 3000:80 cuervo-negro`

### Otras opciones útiles

```bash
# Construir y correr en background
docker build -t cuervo-negro . && docker run -d --name rockstar -p 8080:80 cuervo-negro

# Ver logs
docker logs -f rockstar

# Detener
docker stop rockstar

# Reconstruir después de cambios
docker build -t cuervo-negro . && docker run --rm -p 8080:80 cuervo-negro
```

## Desarrollo local (sin Docker)

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
npm run preview  # sirve dist/ en http://localhost:4173
```

## Credenciales de prueba (backoffice)

| Usuario | Clave | Rol |
| --- | --- | --- |
| `elias` | `1234` | Administrador |
| `Jp` | `1234` | Administrador |
| `Exe` | `1234` | Administrador |

Acceso admin: pantalla inicial → enlace "Acceso administrador" al pie.

## Estructura del proyecto

```
src/
├── App.jsx                  Orquestador de estado y vistas
├── main.jsx                 Entry point
├── index.css                Estilos globales + Tailwind
├── data.js                  Productos, usuarios admin, helper de moneda
└── components/
    ├── ui.jsx               Modal, formularios, mini-componentes
    ├── Header.jsx           Nav + indicador de usuario + carrito
    ├── EntryScreen.jsx      Pantalla inicial
    ├── ShopView.jsx         Tienda
    ├── ProductCard.jsx      Tarjeta de producto
    ├── WarehouseView.jsx    Bodega
    ├── AdminView.jsx        Finanzas & RRHH
    ├── AdminLoginModal.jsx  Login backoffice
    ├── CartSidebar.jsx      Carrito lateral
    └── SupportChat.jsx      Chat de soporte (Roxy)
```
