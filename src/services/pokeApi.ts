// src/services/pokeApi.ts
import { POKEMON_SERVICE_URL, validarUrlServicio } from './config';

export type PokedexData = {
  id: number;
  nombre: string;
  tipos: string[];
  altura: number;
  peso: number;
  habilidad: string;
  imagenPrincipal: string | null;
  imagenShiny: string | null;
  imagenTrasera: string | null;
  movimientos: string[];
  descripcion: string;
};

const TIEMPO_LIMITE_BUSQUEDA_MS = 60_000;

class ErrorApiPokemon extends Error {}

function obtenerApiUrl(): string {
  const serviceUrl = validarUrlServicio(POKEMON_SERVICE_URL, 'EXPO_PUBLIC_POKEMON_API_URL');
  return serviceUrl.endsWith('/api') ? serviceUrl : `${serviceUrl}/api`;
}

// Normaliza la consulta: minúsculas, sin espacios, elimina ceros a la izquierda si es número
function normalizarConsulta(consulta: string): string {
  const valor = consulta.trim().toLowerCase();
  if (/^\d+$/.test(valor)) {
    return String(parseInt(valor, 10));
  }
  return valor;
}

export async function consultarPokemon(consulta: string): Promise<PokedexData> {
  const valor = normalizarConsulta(consulta);
  const apiUrl = obtenerApiUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIEMPO_LIMITE_BUSQUEDA_MS);

  try {
    const respuesta = await fetch(
      `${apiUrl}/pokemons/${encodeURIComponent(valor)}`,
      { signal: controller.signal },
    );

    if (respuesta.status === 404) {
      throw new ErrorApiPokemon('Pokémon no encontrado en la base de datos.');
    }
    if (!respuesta.ok) {
      const mensaje =
        respuesta.status === 503
          ? 'El servicio de Pokémon no está disponible. Revisa que esté activo en Render e inténtalo de nuevo.'
          : `El servicio de Pokémon respondió con el error ${respuesta.status}.`;
      throw new ErrorApiPokemon(mensaje);
    }

    const data = await respuesta.json();

    // Mapeo seguro para transformar la respuesta del backend a la interfaz PokedexData
    return {
      id: data.poke_id ?? data.id,
      nombre: data.name ?? data.nombre,
      tipos: Array.isArray(data.tipos)
        ? data.tipos
        : (data.type ? data.type.split('/') : ['desconocido']),
      altura: data.altura ?? 0,
      peso: data.peso ?? 0,
      habilidad: data.habilidad ?? '—',
      imagenPrincipal: data.image_url ?? data.imagenPrincipal ?? null,
      imagenShiny: data.imagen_shiny ?? data.imagenShiny ?? null,
      imagenTrasera: data.imagen_trasera ?? data.imagenTrasera ?? null,
      movimientos: data.movimientos ?? [],
      descripcion: data.descripcion ?? 'Sin descripción disponible',
    };
  } catch (error) {
    if (error instanceof ErrorApiPokemon) {
      throw error;
    }
    if (controller.signal.aborted) {
      throw new ErrorApiPokemon(
        'La búsqueda tardó más de un minuto. El servicio puede estar iniciando o no responder; vuelve a intentarlo.',
      );
    }
    throw new ErrorApiPokemon('No se pudo conectar con el servicio de Pokémon.');
  } finally {
    clearTimeout(timeout);
  }
}

// Función adicional para obtener la lista completa cargada en la BD
export async function obtenerTodosPokemons(): Promise<PokedexData[]> {
  try {
    const apiUrl = obtenerApiUrl();
    const respuesta = await fetch(`${apiUrl}/pokemons`);
    if (!respuesta.ok) throw new Error('Error al obtener la lista de Pokémons');
    
    const lista = await respuesta.json();
    return lista.map((data: any) => ({
      id: data.poke_id ?? data.id,
      nombre: data.name ?? data.nombre,
      tipos: Array.isArray(data.tipos)
        ? data.tipos
        : (data.type ? data.type.split('/') : ['desconocido']),
      altura: data.altura ?? 0,
      peso: data.peso ?? 0,
      habilidad: data.habilidad ?? '—',
      imagenPrincipal: data.image_url ?? null,
      imagenShiny: data.imagen_shiny ?? null,
      imagenTrasera: data.imagen_trasera ?? null,
      movimientos: data.movimientos ?? [],
      descripcion: data.descripcion ?? 'Sin descripción disponible',
    }));
  } catch (error) {
    console.error('Error en obtenerTodosPokemons:', error);
    throw error;
  }
}