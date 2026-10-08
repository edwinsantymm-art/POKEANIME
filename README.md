# POKEAPI

Aplicación móvil Expo/React Native que consulta tres microservicios desplegables en Render. Los servicios de docentes, Pokémon y Jujutsu Kaisen guardan sus datos en tablas separadas de una misma base PostgreSQL de Neon.

## Servicios

| Servicio | Tabla en Neon | API | Swagger |
| --- | --- | --- | --- |
| Pokémon | `pokemons` | `/api/pokemons`, `/api/pokemons/{nombre-o-numero}` | `/docs` |
| Docentes | `profesores` | `/api/profesores`, `/api/profesores/{id}` | `/docs` |
| Jujutsu Kaisen | `personajes_anime` | `/api/personajes`, `/api/personajes/buscar?consulta=...` | `/docs` |

El servicio de docentes implementa GET, POST, PUT y DELETE. La pantalla **Profesores** permite listar, consultar por ID o nombre, crear, editar y eliminar docentes.

## Configuración local

1. Rota la contraseña de Neon si el connection string se compartió fuera de un gestor de secretos. No guardes la cadena real en el repositorio ni en la app.
2. Configura la misma variable `DATABASE_URL` (con SSL habilitado) en el entorno de cada backend. Para desarrollo local, copia `backend-poke-cloud/.env.example`, `backend-profe-cloud/.env.example` y `backend-anime-cloud/.env.example` a `.env` en sus respectivas carpetas y usa el connection string desde tu gestor local.
3. Instala las dependencias y arranca cada servicio en su propia terminal:

   ```bash
   cd backend-poke-cloud
   npm install
   npm start
   ```

   ```bash
   cd backend-profe-cloud
   npm install
   npm start
   ```

   ```powershell
   cd backend-anime-cloud
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 4100
   ```

   Los servicios validan las tablas existentes (`pokemons`, `profesores` y `personajes_anime`); no crean tablas alternativas ni cargan datos de demostración al iniciar.

4. Copia `.env.example` a `.env` en la raíz de la app. Para probar localmente en un teléfono, sustituye las URLs de Render por la IP local de tu computadora; ambos dispositivos deben estar en la misma red.
5. Arranca la app desde la raíz:

   ```bash
   npm install
   npx expo start
   ```

## Despliegue en Render

El `render.yaml` de la raíz define los tres servicios para desplegarlos juntos como Blueprint:

1. Conecta el repositorio en Render y crea un Blueprint a partir del archivo `render.yaml`. Asegúrate de desplegar un commit que incluya la configuración corregida; el registro compartido muestra dependencias antiguas (`pymongo`) que ya no están en `backend-anime-cloud/requirements.txt`.
2. En cada servicio, establece `DATABASE_URL` en el panel de Render con la conexión de Neon (no la agregues al archivo YAML ni al cliente móvil).
3. Espera que los tres health checks respondan con estado `ok`. Las URLs de documentación quedan disponibles en `<URL-del-servicio>/docs`.
4. Confirma que cada servicio pase su health check. Los health checks confirman conexión y existencia de la tabla que usa el servicio.
5. Reemplaza las URLs de ejemplo en `.env` por las URLs HTTPS que Render asignó a los servicios, con `/api` al final. Reinicia Expo después de cambiar la configuración.

No se puede completar el despliegue remoto ni registrar las URLs públicas desde este workspace: hace falta acceso al proyecto de Render y configurar ahí el secreto de Neon.
