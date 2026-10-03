INSERT INTO profesores (nombre, profesion, imagen, habilidades)
SELECT demo.nombre, demo.profesion, demo.imagen, demo.habilidades
FROM (VALUES
  (
    'Profesor Ejemplo 1',
    'Ingeniero de Software',
    'https://via.placeholder.com/300x300.png?text=Profesor+1',
    ARRAY['React Native', 'Node.js', 'Bases de datos']::TEXT[]
  ),
  (
    'Profesor Ejemplo 2',
    'Magíster en Ciencias de la Computación',
    'https://via.placeholder.com/300x300.png?text=Profesor+2',
    ARRAY['Arquitectura de software', 'Cloud Computing', 'DevOps']::TEXT[]
  )
) AS demo(nombre, profesion, imagen, habilidades)
WHERE NOT EXISTS (SELECT 1 FROM profesores);