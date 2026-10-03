# Microservicio de profesores

API REST independiente con Node.js, Express, PostgreSQL en Neon y Swagger.

## Configuración local

1. Crea una base PostgreSQL en [Neon](https://neon.tech) y copia su connection string.
2. Desde esta carpeta, instala dependencias y crea tu archivo local de configuración:

   ```bash
   npm install
   cp .env.example .env
   ```

3. Asigna el connection string de Neon a `DATABASE_URL` en `.env` y ejecuta:

   ```bash
   npm start
   ```

La tabla `profesores` se crea automáticamente al iniciar. Para cargar dos registros de demostración, ejecuta el contenido de `sql/seed.sql` desde el SQL Editor de Neon. El seed solo agrega datos cuando la tabla está vacía.

La API queda disponible en `http://localhost:3001/api/profesores`, Swagger en `http://localhost:3001/docs` y el health check en `http://localhost:3001/health`.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/profesores` | Lista todos los profesores |
| GET | `/api/profesores/:id` | Obtiene un profesor |
| POST | `/api/profesores` | Crea un profesor |
| PUT | `/api/profesores/:id` | Reemplaza sus datos |
| DELETE | `/api/profesores/:id` | Elimina un profesor |

El cuerpo de creación y actualización usa `nombre` y `profesion` como campos obligatorios. `imagen` puede ser texto o `null`, y `habilidades` una lista de textos.

## Despliegue en Render

El archivo `render.yaml` configura el servicio para desplegar desde la raíz del repositorio. En Render, configura `DATABASE_URL` con el connection string de Neon; no subas el archivo `.env` ni credenciales al repositorio. Render crea la tabla en el arranque.

Para consumir el servicio desde la app, configura la URL base con la ruta `/api`, por ejemplo `https://tu-servicio.onrender.com/api`; así, `GET /profesores` apunta a este backend.