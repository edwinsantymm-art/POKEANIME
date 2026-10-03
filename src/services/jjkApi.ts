const JJK_API_BASE = 'https://data.jujutsukaisenapi.site/api/v1';

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

// Convierte CUALQUIER valor a texto de forma segura, sin importar si llega
// como string, número, null/undefined, o un objeto anidado. Esto evita
// errores como "X.trim is not a function" cuando un campo de la API no es
// el tipo que esperábamos.
function comoTexto(valor: unknown): string {
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'string') return valor;
  if (typeof valor === 'number' || typeof valor === 'boolean') return String(valor);
  return JSON.stringify(valor);
}

function normalizarTexto(valor: unknown): string {
  return comoTexto(valor).trim().toLowerCase();
}

// El nombre puede venir como texto simple ("name": "Yuji Itadori") o como
// objeto con idiomas ("name": { "en": "...", "jp": "..." }). Cubrimos ambos.
function extraerNombre(datos: any): string {
  const campo = datos?.name ?? datos?.nombre ?? datos?.character_name ?? datos?.full_name;
  if (typeof campo === 'string') return campo;
  if (campo && typeof campo === 'object') {
    return comoTexto(campo.en ?? campo.english ?? campo.full ?? campo.first ?? campo.romaji ?? campo);
  }
  return comoTexto(campo);
}

// Recorta y limpia el cuerpo de una respuesta para poder mostrarlo en pantalla
// como diagnóstico, sin que sea un JSON gigante.
function vistaPrevia(valor: unknown): string {
  try {
    const texto = typeof valor === 'string' ? valor : JSON.stringify(valor);
    return texto.length > 300 ? `${texto.slice(0, 300)}…` : texto;
  } catch {
    return String(valor);
  }
}

async function leerCuerpo(respuesta: Response): Promise<any> {
  const texto = await respuesta.text();
  try {
    return JSON.parse(texto);
  } catch {
    // La API respondió algo que no es JSON (por ejemplo una página de error HTML)
    throw new Error(`La API no devolvió JSON válido. Respuesta cruda: ${vistaPrevia(texto)}`);
  }
}

async function obtenerPorId(id: string): Promise<any> {
  const respuesta = await fetch(`${JJK_API_BASE}/characters/${id}`);

  if (respuesta.status === 404) {
    throw new Error('Personaje no encontrado');
  }

  const cuerpo = await leerCuerpo(respuesta);

  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status} en /characters/${id}. Respuesta: ${vistaPrevia(cuerpo)}`);
  }

  return cuerpo;
}

// Esta API pública solo documenta búsqueda por id (GET /characters/:id).
// Para poder buscar por nombre igual que en la Pokédex, si la consulta no es
// un número, pedimos el listado completo (GET /characters) y filtramos aquí.
async function buscarPorNombre(nombre: string): Promise<any> {
  const respuesta = await fetch(`${JJK_API_BASE}/characters`);
  const cuerpo = await leerCuerpo(respuesta);

  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status} en /characters. Respuesta: ${vistaPrevia(cuerpo)}`);
  }

  const items: any[] = Array.isArray(cuerpo)
    ? cuerpo
    : cuerpo?.data ?? cuerpo?.characters ?? cuerpo?.results ?? cuerpo?.items ?? [];

  if (!items.length) {
    throw new Error(`GET /characters no devolvió una lista reconocible. Respuesta: ${vistaPrevia(cuerpo)}`);
  }

  const encontrado = items.find((personaje: any) =>
    normalizarTexto(extraerNombre(personaje)).includes(normalizarTexto(nombre)),
  );

  if (!encontrado) {
    // Diagnóstico: mostramos cuántos personajes llegaron y cómo luce el primero,
    // para poder ajustar el nombre real del campo si "name" no es correcto.
    throw new Error(
      `Personaje no encontrado entre ${items.length} resultados. Primer personaje recibido: ${vistaPrevia(items[0])}`,
    );
  }

  return encontrado;
}

// Forma real confirmada de cada técnica (viene de un error en producción):
// { id, technique_name, description, type, range, image }
function mapearHabilidad(h: any): JJKAbility {
  return {
    id: h?.id ?? h?._id ?? Math.random(),
    nombre: comoTexto(h?.technique_name ?? h?.name ?? h?.nombre) || 'Técnica desconocida',
    descripcion: comoTexto(h?.description ?? h?.descripcion),
    tipo: comoTexto(h?.type ?? h?.tipo),
    alcance: comoTexto(h?.range ?? h?.alcance),
    imagen: typeof h?.image === 'string' ? h.image : typeof h?.img === 'string' ? h.img : null,
  };
}

// Un familiar puede venir como texto simple o como objeto (igual que las técnicas).
function mapearFamiliar(f: any): string {
  if (typeof f === 'string') return f;
  return comoTexto(f?.name ?? f?.nombre ?? f?.family_name ?? f?.relation ?? f?.character_name ?? f?.technique_name) || 'Familiar';
}

function mapearPersonaje(datos: any): JJKCharacterData {
  const habilidadesCrudas =
    datos.techniques ?? datos.abilities ?? datos.powers ?? datos.cursedTechniques ?? [];
  const habilidades: JJKAbility[] = Array.isArray(habilidadesCrudas)
    ? habilidadesCrudas.map(mapearHabilidad)
    : [];

  const familiaresCrudos = datos.family ?? datos.relatives ?? datos.familiares ?? [];
  const familiares: string[] = Array.isArray(familiaresCrudos)
    ? familiaresCrudos.map(mapearFamiliar)
    : familiaresCrudos
      ? [mapearFamiliar(familiaresCrudos)]
      : [];

  return {
    id: datos.id ?? datos._id ?? '—',
    nombre: extraerNombre(datos) || 'Desconocido',
    imagen: typeof datos.image === 'string' ? datos.image : typeof datos.img === 'string' ? datos.img : typeof datos.photo === 'string' ? datos.photo : typeof datos.picture === 'string' ? datos.picture : null,
    altura: comoTexto(datos.height ?? datos.altura) || 'N/D',
    anio: comoTexto(datos.year ?? datos.birthday ?? datos.debut ?? datos.appeared) || 'N/D',
    edad: comoTexto(datos.age ?? datos.edad) || 'N/D',
    grado: comoTexto(datos.grade ?? datos.grado ?? datos.rank ?? datos.cursed_energy_grade) || 'N/D',
    familiares,
    habilidades,
  };
}

export async function consultarPersonaje(consulta: string): Promise<JJKCharacterData> {
  const valor = consulta.trim();

  if (!valor) {
    throw new Error('Escribe el nombre del personaje.');
  }

  const datosCrudos = /^\d+$/.test(valor) ? await obtenerPorId(valor) : await buscarPorNombre(valor);

  return mapearPersonaje(datosCrudos);
}
