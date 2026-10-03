# Microservicio de Pokémon (Node + Express + PostgreSQL + Swagger)

Microservicio propio que **consume una base de datos relacional (PostgreSQL) propia en la nube**,
con 10 Pokémon almacenados, y documentado con Swagger.

## 1. Crear la base de datos PostgreSQL en la nube (gratis)

Usa **Neon** (recomendado, no pide tarjeta):

1. Entra a https://neon.tech y crea una cuenta gratis.
2. Crea un proyecto nuevo (ej. "pokemon-db").
3. En el dashboard del proyecto, copia el **Connection string** (algo como
   `postgresql://usuario:password@ep-xxxx.neon.tech/neondb?sslmode=require`).
4. Abre el **SQL Editor** de Neon (está en el menú del proyecto) y pega y ejecuta
   el contenido de `sql/schema.sql` (crea la tabla, vacía).

(Supabase o Railway Postgres también funcionan exactamente igual, solo cambia de dónde
sacas el `DATABASE_URL`.)

### ¿Cómo se llenan los 10 Pokémon?

**El microservicio llama él mismo a la PokeAPI pública** y guarda esa información en tu
base de datos propia — no son datos escritos a mano. Esa es la conexión real con PokeAPI
que pide el requisito.

Una vez que el servidor esté corriendo (paso 2), ve a Swagger (`/docs`), busca
**POST /api/pokemon/sincronizar**, dale "Try it out" → "Execute". Eso hace que el
microservicio:
1. Llame a `https://pokeapi.co/api/v2/pokemon/{id}` para cada uno de los 10 Pokémon.
2. Guarde (o actualice) esa información en tu tabla `pokemon` de Neon.

A partir de ahí, el resto de endpoints (`GET /api/pokemon`, etc.) ya **no** llaman a
PokeAPI — leen directo de tu base de datos propia, que es como debe funcionar un
microservicio con su propia BD.

(`sql/seed.sql` se deja como respaldo manual, por si PokeAPI estuviera caída justo el
día de la sustentación — pero lo normal es usar `/sincronizar`.)

Si al llamar `/sincronizar` ves error 403 en TODOS los Pokémon, probablemente estás
detrás de un proxy/red que bloquea salidas a internet (por ejemplo, un sandbox o red
corporativa restringida) — pruébalo desde tu PC normal o ya desplegado en Render, ahí
no debería pasar.

## 2. Probar localmente (opcional pero recomendado)

```bash
cd pokemon-service
npm install
cp .env.example .env
# Pega tu DATABASE_URL real dentro de .env
npm start
```

Abre `http://localhost:4000/docs` → ahí está Swagger, con todos los endpoints
listos para probar (botón "Try it out").

## 3. Desplegar en Render (gratis)

1. Sube esta carpeta a un repositorio de GitHub (puede ser privado).
2. Entra a https://render.com, crea cuenta, y da clic en **New +** → **Web Service**.
3. Conecta tu repositorio de GitHub.
4. Configura:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. En la sección **Environment**, agrega la variable:
   - `DATABASE_URL` = tu connection string de Neon
6. Dale a **Create Web Service**. Render te da una URL pública, por ejemplo:
   `https://pokemon-service-xxxx.onrender.com`

## 4. Verificar que quedó público

- `https://tu-servicio.onrender.com/` → mensaje de bienvenida
- `https://tu-servicio.onrender.com/docs` → Swagger UI (documentación interactiva)
- `https://tu-servicio.onrender.com/api/pokemon` → los 10 Pokémon en JSON

## Endpoints

| Método | Ruta              | Descripción                  |
|--------|-------------------|-------------------------------|
| GET    | /api/pokemon       | Lista todos los Pokémon      |
| GET    | /api/pokemon/:id   | Obtiene uno por id           |
| POST   | /api/pokemon       | Crea un Pokémon nuevo        |
| PUT    | /api/pokemon/:id   | Actualiza un Pokémon         |
| DELETE | /api/pokemon/:id   | Elimina un Pokémon           |

(Nota: Render "free tier" duerme el servicio tras ~15 min sin tráfico; la primera
petición después de dormido tarda unos segundos en "despertar". Es normal.)
