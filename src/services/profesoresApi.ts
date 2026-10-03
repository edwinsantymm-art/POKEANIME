import { POKEMON_SERVICE_URL } from './config';

export type Profesor = {
  id: number;
  nombre: string;
  profesion: string;
  imagen: string | null;
  habilidades: string[];
};

export async function obtenerProfesores(): Promise<Profesor[]> {
  let respuesta: Response;

  try {
    respuesta = await fetch(`${POKEMON_SERVICE_URL}/profesores`);
  } catch (error) {
    throw new Error('No se pudo conectar con el microservicio de profesores. Revisa tu conexión a Internet.');
  }

  if (!respuesta.ok) {
    throw new Error('No se pudo conectar con el microservicio de profesores. Revisa tu conexión a Internet.');
  }

  const datos = await respuesta.json();
  return Array.isArray(datos) ? datos : [];
}
