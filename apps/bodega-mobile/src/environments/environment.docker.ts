// Configuración de la imagen Docker (`ng build --configuration docker`).

export const environment = {
  production: true,
  // Ruta relativa: el servidor web del contenedor reenvía `/api` al backend, de modo
  // que la app y la API comparten origen y no hace falta CORS.
  apiUrl: '/api/v1',
  useMockApi: false,
};
