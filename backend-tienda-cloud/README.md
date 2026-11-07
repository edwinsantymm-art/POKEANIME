# Microservicio de tienda de autopartes

Microservicio Node.js conectado a Neon PostgreSQL. Registra cuentas en `public.autopartes_usuarios`, lee productos de `public.autopartes_productos` y guarda cada factura junto con sus artículos en `public.autopartes_facturas` y `public.autopartes_factura_items`.

## Uso local

1. Copia `.env.example` como `.env` y configura `DATABASE_URL` con la conexión protegida de Neon.
2. Configura `AUTH_TOKEN_SECRET` con una cadena aleatoria secreta de al menos 32 caracteres.
3. En Neon SQL Editor, con el propietario de la base de datos, ejecuta `sql/schema.sql` y después `sql/seed.sql`.
4. Da al usuario de `DATABASE_URL` del servicio los permisos de la sección siguiente.
5. Ejecuta `npm install` y `npm start`.

El servicio comprueba las tablas al iniciar; no intenta crearlas con las credenciales de ejecución.

### Permisos del usuario de la app

Reemplaza `usuario_app` por el rol configurado en `DATABASE_URL` y ejecuta estos permisos desde Neon SQL Editor como propietario:

```sql
GRANT USAGE ON SCHEMA public TO usuario_app;
GRANT SELECT ON public.autopartes_productos TO usuario_app;
GRANT SELECT, INSERT ON public.autopartes_usuarios TO usuario_app;
GRANT SELECT, INSERT ON public.autopartes_facturas TO usuario_app;
GRANT SELECT, INSERT ON public.autopartes_factura_items TO usuario_app;
GRANT USAGE ON SEQUENCE
  public.autopartes_usuarios_id_seq,
  public.autopartes_facturas_id_seq,
  public.autopartes_factura_items_id_seq
TO usuario_app;
```

Por defecto escucha en el puerto `4004`; también respeta `PORT`. La URL base local es `http://localhost:4004`.

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/health` | Comprueba la conexión a Neon |
| POST | `/api/auth/register` | Crea una cuenta en Neon |
| POST | `/api/auth/login` | Valida el correo y la contraseña registrados |
| GET | `/api/tienda/productos` | Lista productos activos; requiere sesión |
| POST | `/api/tienda/checkout` | Calcula IVA del 19% y persiste la factura; requiere sesión |

El registro recibe `{ "nombre": "Nombre", "correo": "persona@ejemplo.com", "contraseña": "al-menos-8-caracteres" }`. Neon guarda el nombre, el correo y el hash `scrypt` de la contraseña, nunca la contraseña original. El inicio de sesión devuelve un token de 12 horas. La app lo necesita para consultar el catálogo y guardar compras; cada factura queda asociada al usuario.

El checkout recibe `{ "items": [{ "id": "bat-001", "cantidad": 1 }] }`. Los precios se consultan en Neon, no se aceptan desde la app, y la factura y sus líneas se guardan en una única transacción.

## Conectar la app

La URL local de Expo queda configurada en el `.env` de la raíz del proyecto:

```env
EXPO_PUBLIC_TIENDA_API_URL=http://localhost:4004
```

En un teléfono físico, reemplaza `localhost` por la IP local del computador. En Render, usa el manifiesto `render.yaml` de esta carpeta, configura `DATABASE_URL` y `AUTH_TOKEN_SECRET` como variables secretas y luego asigna a `EXPO_PUBLIC_TIENDA_API_URL` la URL HTTPS que Render proporcione al servicio. Después de cambiar el `.env` de Expo, reinicia Metro.
