CREATE TABLE IF NOT EXISTS pokemon (
  id SERIAL PRIMARY KEY,
  numero INTEGER NOT NULL UNIQUE,
  nombre VARCHAR(50) NOT NULL,
  tipo_principal VARCHAR(30) NOT NULL,
  tipo_secundario VARCHAR(30),
  altura NUMERIC(4,1) NOT NULL,
  peso NUMERIC(6,1) NOT NULL,
  habilidad VARCHAR(50) NOT NULL,
  imagen TEXT,
  descripcion TEXT,
  imagen_shiny TEXT,
  imagen_trasera TEXT,
  movimientos TEXT[] NOT NULL DEFAULT '{}'
);

ALTER TABLE pokemon ADD COLUMN IF NOT EXISTS imagen_shiny TEXT;
ALTER TABLE pokemon ADD COLUMN IF NOT EXISTS imagen_trasera TEXT;
ALTER TABLE pokemon ADD COLUMN IF NOT EXISTS movimientos TEXT[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF to_regclass('public.pokemons') IS NOT NULL THEN
    INSERT INTO pokemon (
      numero, nombre, tipo_principal, tipo_secundario, altura, peso, habilidad,
      imagen, imagen_shiny, imagen_trasera, movimientos, descripcion
    )
    SELECT
      poke_id,
      name,
      COALESCE(NULLIF(SPLIT_PART(type, '/', 1), ''), 'Desconocido'),
      NULLIF(SPLIT_PART(type, '/', 2), ''),
      COALESCE(altura, 0),
      COALESCE(peso, 0),
      COALESCE(NULLIF(habilidad, ''), '—'),
      image_url,
      imagen_shiny,
      imagen_trasera,
      COALESCE(movimientos, '{}'::TEXT[]),
      COALESCE(descripcion, '')
    FROM pokemons
    WHERE poke_id > 0 AND name IS NOT NULL AND BTRIM(name) <> ''
    ON CONFLICT (numero) DO NOTHING;
  END IF;
END $$;
