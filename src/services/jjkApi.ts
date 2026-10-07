import { JJK_SERVICE_URL, validarUrlServicio } from './config';

export type JJKAbility = {
  id: number | string;
  nombre: string;
  descripcion: string;
  tipo: string;
  alcance: string;
  imagen: string | null;
};

export type JJKCharacterData = {
  id: number | string;
  nombre: string;
  imagen: string | null;
  altura: string;
  anio: string;
  edad: string;
  grado: string;
  familiares: string[];
  habilidades: JJKAbility[];
};

type PersonajeNeon = {
  id: number;
  nombre: string;
  imagen: string | null;
  altura: string | null;
  anio: string | null;
  edad: string | null;
  grado: string | null;
  familiares?: string[] | null;
  habilidades?: (string | Partial<JJKAbility>)[];
};

function mapearPersonaje(datos: PersonajeNeon): JJKCharacterData {
  return {
    id: datos.id,
    nombre: datos.nombre,
    imagen: datos.imagen,
    altura: datos.altura ?? 'N/D',
    anio: datos.anio ?? 'N/D',
    edad: datos.edad ?? 'N/D',
    grado: datos.grado ?? 'N/D',
    familiares: Array.isArray(datos.familiares) ? datos.familiares : [],
    habilidades: Array.isArray(datos.habilidades)
      ? datos.habilidades.map((habilidad, index) => {
          if (typeof habilidad === 'string') {
            return {
              id: `${datos.id}-${index}`,
              nombre: habilidad,
              descripcion: '',
              tipo: '',
              alcance: '',
              imagen: null,
            };
          }
          return {
            id: habilidad.id ?? `${datos.id}-${index}`,
            nombre: habilidad.nombre ?? 'Técnica desconocida',
            descripcion: habilidad.descripcion ?? '',
            tipo: habilidad.tipo ?? '',
            alcance: habilidad.alcance ?? '',
            imagen: habilidad.imagen ?? null,
          };
        })
      : [],
  };
}

export async function consultarPersonaje(consulta: string): Promise<JJKCharacterData> {
  const valor = consulta.trim();
  const serviceUrl = validarUrlServicio(JJK_SERVICE_URL, 'EXPO_PUBLIC_JJK_API_URL');
  if (!valor) {
    throw new Error('Escribe el nombre o número del personaje.');
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(
      `${serviceUrl}/personajes/buscar?consulta=${encodeURIComponent(valor)}`,
    );
  } catch {
    throw new Error('No se pudo conectar con el microservicio de Jujutsu Kaisen.');
  }

  const cuerpo = await respuesta.json().catch(() => ({}));
  if (respuesta.status === 404) {
    throw new Error('Personaje no encontrado en la base de datos.');
  }
  if (!respuesta.ok) {
    throw new Error(
      typeof cuerpo?.detail === 'string'
        ? cuerpo.detail
        : 'No se pudo consultar el personaje en la base de datos.',
    );
  }

  return mapearPersonaje(cuerpo as PersonajeNeon);
}
