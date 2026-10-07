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
  const serviceUrl = validarUrlServicio(POKEMON_SERVICE_URL, 'EXPO_PUBLIC_POKEMON_API_URL');

  try {
    const respuesta = await fetch(`${serviceUrl}/pokemons/${encodeURIComponent(valor)}`);

    if (respuesta.status === 404) {
      throw new Error('Pokémon no encontrado');
    }
    if (!respuesta.ok) {
      throw new Error('No se pudo conectar con el microservicio backend.');
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
    if (error instanceof Error && error.message === 'Pokémon no encontrado') {
      throw error;
    }
    throw new Error('No se pudo conectar con el servicio backend.');
  }
}

// Función adicional para obtener la lista completa cargada en la BD
export async function obtenerTodosPokemons(): Promise<PokedexData[]> {
  try {
    const serviceUrl = validarUrlServicio(POKEMON_SERVICE_URL, 'EXPO_PUBLIC_POKEMON_API_URL');
    const respuesta = await fetch(`${serviceUrl}/pokemons`);
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