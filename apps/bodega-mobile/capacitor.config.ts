import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rockstar.bodega',
  appName: 'Rockstar Bodega',
  webDir: 'www',
  // Mismo fondo que la app, para que no se vea un destello blanco al abrirla.
  backgroundColor: '#0b0b0e',
};

export default config;
