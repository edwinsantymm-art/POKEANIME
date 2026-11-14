ALTER TABLE public.autopartes_productos
  ADD COLUMN IF NOT EXISTS plataforma VARCHAR(20);

ALTER TABLE public.autopartes_productos
  ADD COLUMN IF NOT EXISTS stock INTEGER;

ALTER TABLE public.autopartes_productos
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(1000);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.autopartes_productos'::regclass
      AND conname = 'autopartes_productos_plataforma_check'
  ) THEN
    ALTER TABLE public.autopartes_productos
      ADD CONSTRAINT autopartes_productos_plataforma_check
      CHECK (plataforma IS NULL OR plataforma IN ('PlayStation', 'Xbox', 'Nintendo'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.autopartes_productos'::regclass
      AND conname = 'autopartes_productos_stock_check'
  ) THEN
    ALTER TABLE public.autopartes_productos
      ADD CONSTRAINT autopartes_productos_stock_check
      CHECK (stock IS NULL OR stock >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.autopartes_productos'::regclass
      AND conname = 'autopartes_productos_image_url_check'
  ) THEN
    ALTER TABLE public.autopartes_productos
      ADD CONSTRAINT autopartes_productos_image_url_check
      CHECK (image_url IS NULL OR image_url LIKE 'https://%');
  END IF;
END
$$;
