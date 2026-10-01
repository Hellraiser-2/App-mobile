// `ng build` reemplaza este archivo por `environment.prod.ts` (ver `fileReplacements` en angular.json).

export const environment = {
  production: false,
  /** URL del API Gateway. En un dispositivo, usa la IP del equipo en lugar de localhost. */
  apiUrl: 'http://localhost:3000/api/v1',
  /** Con `true`, la app responde con el backend simulado en memoria y no necesita servicios. */
  useMockApi: true,
};
