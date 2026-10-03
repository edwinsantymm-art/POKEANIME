CREATE TABLE IF NOT EXISTS profesores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL CHECK (BTRIM(nombre) <> ''),
  profesion VARCHAR(150) NOT NULL CHECK (BTRIM(profesion) <> ''),
  imagen TEXT,
  habilidades TEXT[] NOT NULL DEFAULT '{}'
);