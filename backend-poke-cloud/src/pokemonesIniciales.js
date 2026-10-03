// pokemon-service/src/pokemonesIniciales.js
const axios = require('axios');
const pool = require('./db');

function limpiarTexto(texto) {
  return texto
    ? texto.replace(/\f/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\s+/g, ' ').trim()
    : 'Descripción no disponible.';
}

async function syncAndStorePokemons(limit = 10) {
  try {
    // 1. Crear tabla con el esquema completo en Neon PostgreSQL
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pokemons (
        id SERIAL PRIMARY KEY,
        poke_id INT UNIQUE NOT NULL,
        name VARCHAR(50) NOT NULL,
        type VARCHAR(100) NOT NULL,
        altura NUMERIC(5, 2),
        peso NUMERIC(5, 2),
        habilidad VARCHAR(100),
        image_url TEXT,
        imagen_shiny TEXT,
        imagen_trasera TEXT,
        movimientos TEXT[],
        descripcion TEXT
      );
    `);

    // 2. Obtener pokemones de la PokéAPI pública
    const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);

    for (const item of data.results) {
      const detailRes = await axios.get(item.url);
      const pokeData = detailRes.data;

      // Obtener descripción de la especie
      let descripcion = 'Descripción no disponible.';
      try {
        const especieRes = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokeData.id}`);
        const entradas = especieRes.data?.flavor_text_entries || [];
        const enEs = entradas.find(e => e.language?.name === 'es');
        const enEn = entradas.find(e => e.language?.name === 'en');
        descripcion = limpiarTexto(enEs?.flavor_text || enEn?.flavor_text);
      } catch (e) {
        // Ignorar falla de especie si no existe
      }

      const pokeId = pokeData.id;
      const name = pokeData.name;
      const type = pokeData.types.map(t => t.type.name).join('/');
      const altura = pokeData.height / 10; // decímetros -> metros
      const peso = pokeData.weight / 10;   // hectogramos -> kilogramos
      const habilidad = pokeData.abilities?.[0]?.ability?.name || '—';
      const imageUrl = pokeData.sprites?.other?.['official-artwork']?.front_default || pokeData.sprites?.front_default || null;
      const imagenShiny = pokeData.sprites?.other?.['official-artwork']?.front_shiny || pokeData.sprites?.front_shiny || null;
      const imagenTrasera = pokeData.sprites?.back_default || null;
      const movimientos = (pokeData.moves || []).slice(0, 4).map(m => m.move.name);

      // 3. Insertar o actualizar en Neon PostgreSQL
      const query = `
        INSERT INTO pokemons 
        (poke_id, name, type, altura, peso, habilidad, image_url, imagen_shiny, imagen_trasera, movimientos, descripcion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (poke_id) DO UPDATE SET 
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          altura = EXCLUDED.altura,
          peso = EXCLUDED.peso,
          habilidad = EXCLUDED.habilidad,
          image_url = EXCLUDED.image_url,
          imagen_shiny = EXCLUDED.imagen_shiny,
          imagen_trasera = EXCLUDED.imagen_trasera,
          movimientos = EXCLUDED.movimientos,
          descripcion = EXCLUDED.descripcion;
      `;

      await pool.query(query, [
        pokeId, name, type, altura, peso, habilidad, 
        imageUrl, imagenShiny, imagenTrasera, movimientos, descripcion
      ]);
    }

    console.log(`Sincronización completada: ${limit} Pokémons guardados en Neon DB con información detallada.`);
 } catch (error) {
    console.error('Error durante la sincronización:', error); // Cambiado a 'error' completo
  }
}

module.exports = syncAndStorePokemons;