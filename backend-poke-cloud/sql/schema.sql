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
  descripcion TEXT
);
