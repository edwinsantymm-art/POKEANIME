# Microservicio de Personajes de Anime (Python + FastAPI + MongoDB + Swagger)

Microservicio propio que **consume una base de datos no relacional (MongoDB) propia en la nube**,
con 10 personajes de Jujutsu Kaisen almacenados. FastAPI genera Swagger automáticamente.

## 1. Crear la base de datos MongoDB en la nube (gratis)

1. Entra a https://www.mongodb.com/cloud/atlas/register y crea una cuenta gratis.
2. Crea un **cluster gratuito (M0)**.
3. En "Database Access", crea un usuario con contraseña.
4. En "Network Access", agrega `0.0.0.0/0` (permitir acceso desde cualquier IP; es lo más
   simple para que el microservicio desplegado en Render/Railway pueda conectarse).
5. En "Database" → tu cluster → **Connect** → **Drivers**, copia el connection string,
   algo como:
   ```
   mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/anime_db?retryWrites=true&w=majority
   ```
   (Asegúrate de que tenga `/anime_db` antes de los parámetros `?...`, así la base de datos
   por defecto ya queda definida.)

## 2. Probar localmente y sembrar los 10 personajes

```bash
cd anime-service
python -m venv venv
source venv/bin/activate      # En Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Pega tu MONGO_URI real dentro de .env

python seed.py                # Inserta los 10 personajes
uvicorn main:app --reload --port 4100
```

Abre `http://localhost:4100/docs` → Swagger generado automáticamente por FastAPI,
con todos los endpoints listos para probar.

## 3. Desplegar en Render (gratis)

1. Sube esta carpeta a un repositorio de GitHub.
2. Entra a https://render.com → **New +** → **Web Service** → conecta tu repo.
3. Configura:
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. En **Environment**, agrega la variable:
   - `MONGO_URI` = tu connection string de MongoDB Atlas
5. Dale a **Create Web Service**.
6. Una vez desplegado, entra una sola vez por SSH/Shell de Render (o corre `python seed.py`
   localmente apuntando al mismo `MONGO_URI` de producción) para sembrar los 10 personajes
   en la base de datos real que usará el servicio en la nube.

## 4. Verificar que quedó público

- `https://tu-servicio.onrender.com/` → mensaje de bienvenida
- `https://tu-servicio.onrender.com/docs` → Swagger UI
- `https://tu-servicio.onrender.com/api/personajes` → los 10 personajes en JSON

## Endpoints

| Método | Ruta                     | Descripción                     |
|--------|--------------------------|-----------------------------------|
| GET    | /api/personajes           | Lista todos los personajes       |
| GET    | /api/personajes/{id}      | Obtiene uno por id de MongoDB    |
| POST   | /api/personajes           | Crea un personaje nuevo          |
| PUT    | /api/personajes/{id}      | Actualiza un personaje           |
| DELETE | /api/personajes/{id}      | Elimina un personaje             |
