# Microservicio de Jujutsu Kaisen

API FastAPI documentada con OpenAPI/Swagger que busca en la tabla existente `public.personajes_anime` de PostgreSQL en Neon. No crea otra tabla, no usa MongoDB ni consulta una API externa.

## Uso local

1. Copia `.env.example` como `.env` y configura `DATABASE_URL` con la conexión protegida de Neon.
2. Instala los paquetes e inicializa los registros:

   ```powershell
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   python seed.py
   uvicorn main:app --reload --port 4100
   ```

3. Abre `http://localhost:4100/docs`. Al iniciar, el servicio comprueba la conexión y verifica que exista `public.personajes_anime`.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/personajes` | Lista desde Neon |
| GET | `/api/personajes/buscar?consulta=...` | Busca por nombre o ID |
| GET | `/api/personajes/{id}` | Consulta por ID |
| POST | `/api/personajes` | Crea un personaje |
| PUT | `/api/personajes/{id}` | Actualiza un personaje |
| DELETE | `/api/personajes/{id}` | Elimina un personaje |

## Render

El `render.yaml` de la raíz despliega este servicio junto con los servicios de Pokémon y docentes. Configura `DATABASE_URL` como secreto del servicio. La búsqueda se adapta a columnas comunes (`nombre`/`name`, `imagen`/`image`, etc.) de `personajes_anime`.
