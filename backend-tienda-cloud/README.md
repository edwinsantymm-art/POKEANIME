# API de GameShop

Servicio Node.js/Express que conserva la base PostgreSQL existente y atiende la tienda móvil.

## Rutas existentes

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `/health` | Comprueba la conexión a Neon |
| POST | `/api/auth/register` | Registra una cuenta |
| POST | `/api/auth/login` | Inicia sesión |
| GET | `/api/tienda/productos` | Lista juegos físicos con su plataforma y stock |
| POST | `/api/tienda/checkout` | Valida y descuenta stock; guarda factura y artículos |

El catálogo y las facturas siguen siendo información persistente de Neon. El checkout obtiene precios desde la base, bloquea las filas de inventario, valida las cantidades y descuenta el stock en la misma transacción que guarda la factura. Las compras simultáneas no pueden vender unidades por debajo de cero.

## Despliegue y base de datos existente

Configura `DATABASE_URL` y `AUTH_TOKEN_SECRET` como secretos de Render. Antes de desplegar esta versión, ejecuta en Neon:

1. `sql/migrations/20261113_add_video_game_inventory.sql`
2. `sql/seed.sql`

La migración añade `plataforma`, `stock` e `image_url` como columnas opcionales; no cambia ni elimina registros actuales. Los productos de autopartes existentes quedan fuera del catálogo de videojuegos. El seed agrega diez videojuegos con diez unidades cada uno y usa `ON CONFLICT DO NOTHING`, por lo que no reemplaza registros existentes.

El precio inicial de cada videojuego está en `sql/seed.sql`; compruébalo y ajústalo antes de operar ventas. El frontend lee su URL desde `EXPO_PUBLIC_TIENDA_API_URL`; usa la URL HTTPS del servicio Render o, en desarrollo local, `http://localhost:4004`.
