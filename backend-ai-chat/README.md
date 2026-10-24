# Servicio de preguntas con datos propios

Backend Node.js/Express que consulta las tablas existentes `public.pokemons` y `public.personajes_anime` en Neon. Para preguntas sobre un Pokémon registrado, el proveedor seleccionado recibe el registro de Neon y puede complementar la respuesta con su conocimiento general, por ejemplo, información sobre episodios. Para preguntas sobre personajes de anime, el proveedor selecciona campos existentes en Neon y la API arma la respuesta con esos valores.

## Requisitos

- Node.js 20 o superior
- Una base de datos PostgreSQL en Neon
- La API key de al menos un proveedor de IA: Gemini, OpenAI o DeepSeek

## Configurar Neon

Desde esta carpeta, copia `.env.example` a `.env` y completa `NEON_DATABASE_URL` y la(s) clave(s) de los proveedores que quieras habilitar. Configura `GEMINI_API_KEY` (modelo por defecto `gemini-3.5-flash-lite`), `OPENAI_API_KEY` (modelo por defecto `gpt-4o-mini`) o `DEEPSEEK_API_KEY` (modelo por defecto `deepseek-chat`). Las variables `*_MODEL` permiten elegir otro modelo compatible. El endpoint `/api/providers` muestra los tres proveedores y señala cuáles están configurados para que la app informe cuáles requieren clave. Guarda las claves únicamente en el entorno del servidor; no las incluyas en la app Expo ni las confirmes en Git. El usuario de Neon configurado en `NEON_DATABASE_URL` necesita permiso `SELECT` sobre `public.pokemons` y `public.personajes_anime`.

Si `/health` indica que falta permiso de lectura, ejecuta en el SQL Editor de Neon con un usuario propietario/administrador (ajusta el rol si el usuario de la URL no es `authenticator`):

```sql
GRANT USAGE ON SCHEMA public TO authenticator;
GRANT SELECT ON TABLE public.pokemons, public.personajes_anime TO authenticator;
```

## Instalar e iniciar

Configura `NEON_DATABASE_URL` y al menos una API key de IA en `.env` antes de arrancar. Si una clave se compartió fuera del gestor de secretos, revócala y reemplázala.

```powershell
npm install
npm run dev
```

Para iniciar Expo Go y este backend juntos, ejecuta `npm start` desde la raíz; usa `npm run web` para Expo Web. El comando de inicio configura automáticamente la IP local del backend para que un teléfono en la misma red Wi-Fi pueda conectarse. Para iniciar solo el backend, usa los comandos anteriores desde esta carpeta. El API escucha en el puerto 4000 en las interfaces de red disponibles. Comprueba `/health`; el endpoint de preguntas es `POST /api/chat`:

```json
{ "question": "¿Qué tipo es Pikachu?", "aiService": "gemini" }
```

`aiService` admite `gemini`, `openai` y `deepseek`; es opcional para clientes anteriores y su valor predeterminado es `gemini`. `GET /api/providers` devuelve los proveedores configurados para que la app muestre solo los disponibles. La app móvil permite elegir el tiempo máximo de espera de la solicitud (20, 40, 80 o 160 segundos); el límite se aplica en el cliente y cancela la espera si el backend no responde a tiempo.

Si inicias Expo directamente con `npx expo start` en vez de `npm start`, configura `EXPO_PUBLIC_AI_CHAT_API_URL` como `http://<IP-local-de-tu-computadora>:4000/api`; `localhost` en el teléfono apunta al propio teléfono. El teléfono y la computadora deben usar la misma red Wi-Fi.

Las preguntas vacías o mayores de 500 caracteres se rechazan. Si no hay filas relacionadas, responde exactamente `Información no encontrada en la base de datos.`. Los errores de Neon y del proveedor seleccionado se devuelven como errores HTTP y se registran en el backend.

## Conectar Expo

En el `.env` de la raíz, configura `EXPO_PUBLIC_AI_CHAT_API_URL` con la URL pública del backend y `/api` al final. En un teléfono físico, usa la IP local de la computadora en lugar de `localhost`. Reinicia Expo al cambiar variables públicas.

## Despliegue

El `render.yaml` de la raíz define `ai-chat-service`. Configura `NEON_DATABASE_URL` y las API keys de los proveedores que desees habilitar (`GEMINI_API_KEY`, `OPENAI_API_KEY` y/o `DEEPSEEK_API_KEY`) como secretos en Render. Puedes configurar opcionalmente las variables de modelo correspondientes. La URL base del servicio más `/api` se usa como `EXPO_PUBLIC_AI_CHAT_API_URL` en Expo.

## Tablas existentes y fuentes de respuesta

1. El backend adapta las columnas disponibles de `public.pokemons` y `public.personajes_anime` a campos permitidos. No crea tablas ni inserta datos.
2. Para preguntas sobre Pokémon, el backend identifica el Pokémon por su nombre exacto en la tabla. Si no aparece en Neon, devuelve el mensaje fijo de información no encontrada.
3. El proveedor de IA seleccionado recibe la pregunta y únicamente los registros coincidentes de Neon. Usa esos valores como fuente autoritativa para los campos almacenados y puede contestar preguntas relacionadas con su conocimiento general cuando Neon no contiene ese dato.
4. La respuesta de Pokémon es texto generado por el proveedor seleccionado y puede incluir información general no almacenada en Neon; si el modelo no puede responder con confianza, debe indicarlo. No se usa búsqueda web ni otra herramienta externa.
5. Para consultas sobre personajes de anime, la salida continúa restringida a seleccionar campos permitidos de filas de Neon y la respuesta se ensambla con esos valores.

La pantalla indica la fuente de cada respuesta. El conocimiento general del modelo puede contener errores; verifica datos importantes como números de episodios.
