CREATE TABLE IF NOT EXISTS public.autopartes_productos (
  id VARCHAR(30) PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  categoria VARCHAR(60) NOT NULL,
  plataforma VARCHAR(20) CHECK (plataforma IN ('PlayStation', 'Xbox', 'Nintendo')),
  descripcion VARCHAR(300) NOT NULL DEFAULT '',
  image_url VARCHAR(1000),
  precio NUMERIC(12, 2) NOT NULL CHECK (precio >= 0),
  stock INTEGER CHECK (stock IS NULL OR stock >= 0),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.autopartes_usuarios (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  correo VARCHAR(254) NOT NULL UNIQUE,
  password_hash BYTEA NOT NULL,
  password_salt BYTEA NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.autopartes_facturas (
  id BIGSERIAL PRIMARY KEY,
  numero VARCHAR(48) NOT NULL UNIQUE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usuario_id BIGINT REFERENCES public.autopartes_usuarios(id),
  subtotal NUMERIC(14, 2) NOT NULL CHECK (subtotal >= 0),
  iva NUMERIC(14, 2) NOT NULL CHECK (iva >= 0),
  porcentaje_iva SMALLINT NOT NULL DEFAULT 19,
  total NUMERIC(14, 2) NOT NULL CHECK (total >= 0),
  moneda CHAR(3) NOT NULL DEFAULT 'COP'
);

ALTER TABLE public.autopartes_facturas
  ADD COLUMN IF NOT EXISTS usuario_id BIGINT REFERENCES public.autopartes_usuarios(id);

CREATE TABLE IF NOT EXISTS public.autopartes_factura_items (
  id BIGSERIAL PRIMARY KEY,
  factura_id BIGINT NOT NULL REFERENCES public.autopartes_facturas(id) ON DELETE CASCADE,
  producto_id VARCHAR(30) NOT NULL REFERENCES public.autopartes_productos(id),
  nombre_producto VARCHAR(160) NOT NULL,
  precio_unitario NUMERIC(12, 2) NOT NULL CHECK (precio_unitario >= 0),
  cantidad INTEGER NOT NULL CHECK (cantidad BETWEEN 1 AND 99),
  total_linea NUMERIC(14, 2) NOT NULL CHECK (total_linea >= 0),
  UNIQUE (factura_id, producto_id)
);

CREATE INDEX IF NOT EXISTS autopartes_factura_items_factura_id_idx
  ON public.autopartes_factura_items (factura_id);

CREATE INDEX IF NOT EXISTS autopartes_facturas_usuario_id_idx
  ON public.autopartes_facturas (usuario_id);

ALTER TABLE public.autopartes_productos
  ADD COLUMN IF NOT EXISTS plataforma VARCHAR(20);

ALTER TABLE public.autopartes_productos
  ADD COLUMN IF NOT EXISTS stock INTEGER;
