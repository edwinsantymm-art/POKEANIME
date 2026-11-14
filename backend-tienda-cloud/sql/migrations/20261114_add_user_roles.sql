-- Agrega el rol de las cuentas sin modificar los usuarios existentes.
-- Todas las cuentas actuales quedan como 'usuario'.
ALTER TABLE public.autopartes_usuarios
  ADD COLUMN IF NOT EXISTS rol VARCHAR(20) NOT NULL DEFAULT 'usuario';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.autopartes_usuarios'::regclass
      AND conname = 'autopartes_usuarios_rol_check'
  ) THEN
    ALTER TABLE public.autopartes_usuarios
      ADD CONSTRAINT autopartes_usuarios_rol_check
      CHECK (rol IN ('usuario', 'administrador'));
  END IF;
END $$;
