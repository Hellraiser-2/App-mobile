export function iniciarEntornoLocal(opciones?: {
  puertoApi?: number;
  silencioso?: boolean;
}): Promise<{ apiUrl: string; detener: () => Promise<void> }>;
