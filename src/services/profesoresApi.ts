import { PROFESORES_SERVICE_URL, validarUrlServicio } from './config';

export type Profesor = {
  id: number;
  nombre: string;
  profesion: string;
  universidad?: string | null;
  imagen: string | null;
  habilidades: string[];
};

export type ProfesorInput = Omit<Profesor, 'id' | 'universidad'>;

async function solicitar<T>(ruta: string, init?: RequestInit): Promise<T> {
  const serviceUrl = validarUrlServicio(PROFESORES_SERVICE_URL, 'EXPO_PUBLIC_PROFESORES_API_URL');
  let respuesta: Response;

  try {
    respuesta = await fetch(`${serviceUrl}${ruta}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  } catch {
    throw new Error('No se pudo conectar con el microservicio de profesores. Revisa tu conexión a Internet.');
  }

  let datos: unknown;
  try {
    datos = await respuesta.json();
  } catch {
    throw new Error('El microservicio de profesores devolvió una respuesta inválida.');
  }
  if (!respuesta.ok) {
    const mensaje =
      typeof datos === 'object' &&
      datos !== null &&
      'error' in datos &&
      typeof datos.error === 'string'
        ? datos.error
        : 'No se pudo completar la operación con el microservicio de profesores.';
    throw new Error(mensaje);
  }

  return datos as T;
}

export async function obtenerProfesores(): Promise<Profesor[]> {
  const datos = await solicitar<Profesor[]>('/profesores');
  return Array.isArray(datos) ? datos : [];
}

export function obtenerProfesor(id: number): Promise<Profesor> {
  return solicitar<Profesor>(`/profesores/${id}`);
}

export function crearProfesor(profesor: ProfesorInput): Promise<Profesor> {
  return solicitar<Profesor>('/profesores', {
    method: 'POST',
    body: JSON.stringify(profesor),
  });
}

export function actualizarProfesor(id: number, profesor: ProfesorInput): Promise<Profesor> {
  return solicitar<Profesor>(`/profesores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(profesor),
  });
}

export function eliminarProfesor(id: number): Promise<void> {
  return solicitar<void>(`/profesores/${id}`, { method: 'DELETE' });
}
