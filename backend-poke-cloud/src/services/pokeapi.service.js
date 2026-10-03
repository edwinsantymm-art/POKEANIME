const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

// Sin un User-Agent, la protección anti-bots de PokeAPI puede responder 403.
const CABECERAS = {
  'User-Agent': 'pokemon-service/1.0 (proyecto universitario - microservicio propio)',
  Accept: 'application/json',
};

function limpiarTexto(texto) {
  return texto
    .replace(/\f/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extraerDescripcion(especie) {
  const entradas = especie?.flavor_text_entries || [];

  const enEspanol = entradas.find((e) => e.language?.name === 'es');
  if (enEspanol) return limpiarTexto(enEspanol.flavor_text);

  const enIngles = entradas.find((e) => e.language?.name === 'en');
  if (enIngles) return limpiarTexto(enIngles.flavor_text);

  return 'Descripción no disponible.';
}

// Esta es la conexión real del microservicio con la PokeAPI pública.
async function obtenerPokemonDesdePokeAPI(idONombre) {
  const respuestaPokemon = await fetch(`${POKEAPI_BASE}/pokemon/${idONombre}`, { headers: CABECERAS });
  if (!respuestaPokemon.ok) {
    throw new Error(`No se pudo obtener el Pokémon "${idONombre}" desde PokeAPI (status ${respuestaPokemon.status})`);
  }
  const datos = await respuestaPokemon.json();

  let especie = null;
  try {
    const respuestaEspecie = await fetch(`${POKEAPI_BASE}/pokemon-species/${datos.id}`, { headers: CABECERAS });
    if (respuestaEspecie.ok) {
      especie = await respuestaEspecie.json();
    }
  } catch (error) {
    // si falla la especie, seguimos sin descripción en vez de romper todo
  }

  return {
    numero: datos.id,
    nombre: datos.name,
    tipo_principal: datos.types?.[0]?.type?.name ?? 'normal',
    tipo_secundario: datos.types?.[1]?.type?.name ?? null,
    altura: datos.height / 10,
    peso: datos.weight / 10,
    habilidad: datos.abilities?.[0]?.ability?.name ?? 'desconocida',
    imagen:
      datos.sprites?.other?.['official-artwork']?.front_default ?? datos.sprites?.front_default ?? null,
    descripcion: especie ? extraerDescripcion(especie) : 'Descripción no disponible.',
  };
}

module.exports = { obtenerPokemonDesdePokeAPI };
