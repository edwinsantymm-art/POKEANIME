# Microservicio de Pokémon

Servicio Node.js/Express respaldado por PostgreSQL en Neon. La búsqueda y el listado leen la tabla existente `public.pokemons`; el servicio no crea una tabla alternativa ni carga datos de ejemplo al arrancar.

## Uso local

1. Copia `.env.example` como `.env` y configura `DATABASE_URL` con el connection string de Neon. Nunca guardes la contraseña real en Git.
2. Instala y ejecuta:

   ```bash
   npm install
   npm start
   ```

3. Prueba `http://localhost:3000/docs` y `http://localhost:3000/health`.

La app móvil consulta `/api/pokemons` y `/api/pokemons/{nombre-o-numero}`; ambos endpoints leen únicamente `public.pokemons`. El microservicio espera que la tabla tenga al menos `poke_id` y `name`, además de los campos que la app muestra (`type`, `altura`, `peso`, `habilidad`, `image_url`, `imagen_shiny`, `imagen_trasera`, `movimientos`, `descripcion`).

## Render

`render.yaml` en la raíz del repositorio declara los tres microservicios. También se puede desplegar este servicio de forma independiente con el `render.yaml` de esta carpeta. Configura `DATABASE_URL` en las variables secretas del servicio de Render.
