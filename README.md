# POKEAPI

Aplicación móvil Expo/React Native que consulta tres microservicios desplegables en Render. Los servicios de docentes, Pokémon y Jujutsu Kaisen guardan sus datos en tablas separadas de una misma base PostgreSQL de Neon.

## Servicios

| Servicio | Tabla en Neon | API | Swagger |
| --- | --- | --- | --- |
| Pokémon | `pokemons` | `/api/pokemons`, `/api/pokemons/{nombre-o-numero}` | `/docs` |
| Docentes | `profesores` | `/api/profesores`, `/api/profesores/{id}` | `/docs` |
| Jujutsu Kaisen | `personajes_anime` | `/api/personajes`, `/api/personajes/buscar?consulta=...` | `/docs` |

El servicio de docentes implementa GET, POST, PUT y DELETE. La pantalla **Profesores** permite listar, consultar por ID o nombre, crear, editar y eliminar docentes.

## Sincronización de docentes

La pantalla **Profesores** guarda los docentes en SQLite en el dispositivo y revisa la lista del microservicio mientras la app está en primer plano y hay conexión. El intervalo se puede elegir en la pantalla (2, 10 o 30 segundos) y la preferencia se conserva localmente. Al volver a conectarse, los registros creados sin conexión se envían a la nube y se descargan los cambios remotos; los registros nuevos detectados se marcan como **NUEVO** hasta consultarlos por ID. La primera descarga establece la copia inicial y no marca los registros existentes como nuevos.

Si un docente pendiente coincide exactamente en nombre, profesión, imagen y habilidades con uno ya existente en Neon (las habilidades se comparan sin importar su orden), se vincula al registro remoto y se conserva la versión de la nube. Esto evita crear una copia adicional en el escenario de creación local y remota simultáneas. El resto de coincidencias no exactas se conserva como registros independientes.

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
   npm start
   ```

   `npm start` inicia Expo Go y el backend de chat en el puerto 4000. También puedes usar `npm run web` para Expo Web. Al iniciar, el comando detecta la IP local de la computadora y la usa para el chat en vez de `localhost`, que no es accesible desde el teléfono. Conecta el teléfono y la computadora a la misma red Wi-Fi, abre el QR con Expo Go y permite Node.js en la red privada de Windows si el firewall lo solicita. Si las redes son distintas, configura `EXPO_PUBLIC_AI_CHAT_API_URL` con la URL pública del backend.

   Antes de iniciar, configura `NEON_DATABASE_URL` y al menos una clave de proveedor (`GEMINI_API_KEY`, `OPENAI_API_KEY` o `DEEPSEEK_API_KEY`) en `backend-ai-chat/.env`. El chat permite elegir entre los proveedores configurados en el backend; las claves nunca se guardan en la app móvil.

## Despliegue en Render

El `render.yaml` de la raíz define los cuatro servicios para desplegarlos juntos como Blueprint:

1. Conecta el repositorio en Render y crea un Blueprint a partir del archivo `render.yaml`. Asegúrate de desplegar un commit que incluya la configuración corregida; el registro compartido muestra dependencias antiguas (`pymongo`) que ya no están en `backend-anime-cloud/requirements.txt`.
2. En los servicios de Pokémon, docentes y Jujutsu Kaisen, establece `DATABASE_URL` en el panel de Render. En `ai-chat-service`, establece `NEON_DATABASE_URL` y las claves de IA que quieras habilitar (`GEMINI_API_KEY`, `OPENAI_API_KEY` y/o `DEEPSEEK_API_KEY`) como secretos; no agregues credenciales al YAML ni al cliente móvil.
3. Espera que los cuatro health checks respondan con estado `ok`. Las URLs de documentación quedan disponibles en `<URL-del-servicio>/docs`.
4. Confirma que cada servicio pase su health check. El chat también valida acceso a las tablas `pokemons` y `personajes_anime` y que tenga configurada al menos una API key de IA.
5. Reemplaza las URLs de ejemplo en `.env` por las URLs HTTPS que Render asignó a los servicios, con `/api` al final, incluida `EXPO_PUBLIC_AI_CHAT_API_URL`. Reinicia Expo después de cambiar la configuración.

No se puede completar el despliegue remoto ni registrar las URLs públicas desde este workspace: hace falta acceso al proyecto de Render y configurar ahí el secreto de Neon.
