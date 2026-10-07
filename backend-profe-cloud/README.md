# Microservicio de docentes

API REST independiente con Node.js, Express, PostgreSQL en Neon y Swagger. Opera sobre la tabla existente `public.profesores` sin intentar crearla o cambiar su esquema.

## Uso local

1. Copia `.env.example` como `.env` y configura `DATABASE_URL`. No compartas ni confirmes ese archivo en Git.
2. Desde esta carpeta instala dependencias e inicia:

   ```bash
   npm install
   npm start
   ```

Swagger está en `http://localhost:3001/docs` y la comprobación de servicio/base de datos en `http://localhost:3001/health`.

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/profesores` | Lista docentes |
| GET | `/api/profesores/{id}` | Consulta un docente |
| POST | `/api/profesores` | Crea un docente |
| PUT | `/api/profesores/{id}` | Actualiza un docente |
| DELETE | `/api/profesores/{id}` | Elimina un docente |

`nombre` y `profesion` son obligatorios. `universidad`, `imagen` y `habilidades` son opcionales.

## Render

El `render.yaml` de la raíz despliega los tres microservicios como Blueprint. También puedes desplegar solo este directorio con el manifiesto local. En Render, configura `DATABASE_URL` como variable secreta con la conexión de Neon.
