CREATE TABLE IF NOT EXISTS personajes_jjk (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  anime VARCHAR(100) NOT NULL DEFAULT 'Jujutsu Kaisen',
  imagen TEXT,
  altura VARCHAR(50),
  anio VARCHAR(50),
  edad VARCHAR(50),
  grado VARCHAR(150),
  familiares TEXT[] NOT NULL DEFAULT '{}',
  habilidades TEXT[] NOT NULL DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS personajes_jjk_nombre_lower_uq
  ON personajes_jjk (LOWER(nombre));
