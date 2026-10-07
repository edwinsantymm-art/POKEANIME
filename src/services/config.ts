function normalizarUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export const POKEMON_SERVICE_URL = normalizarUrl(
  process.env.EXPO_PUBLIC_POKEMON_API_URL ?? '',
);

export const PROFESORES_SERVICE_URL = normalizarUrl(
  process.env.EXPO_PUBLIC_PROFESORES_API_URL ?? '',
);

export const JJK_SERVICE_URL = normalizarUrl(
  process.env.EXPO_PUBLIC_JJK_API_URL ?? '',
);

export function validarUrlServicio(url: string, variable: string): string {
  if (!url) {
    throw new Error(`Configura ${variable} con la URL pública del microservicio.`);
  }
  return url;
}