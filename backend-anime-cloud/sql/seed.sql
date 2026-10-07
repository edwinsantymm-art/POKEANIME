INSERT INTO personajes_jjk (nombre, anime, imagen, altura, anio, edad, grado, habilidades)
VALUES
  ('Yuji Itadori', 'Jujutsu Kaisen', 'https://upload.wikimedia.org/wikipedia/en/d/d7/Yuuji_Itadori.png', '173 cm', '2018', '15', 'Grado Especial (como vasija de Sukuna)', ARRAY['Fuerza sobrehumana', 'Divergent Fist', 'Black Flash']),
  ('Megumi Fushiguro', 'Jujutsu Kaisen', 'https://upload.wikimedia.org/wikipedia/en/a/a2/Megumi_Fushiguro.png', '170 cm', '2018', '15', 'Grado 2 (asciende a Grado 1)', ARRAY['Invocación de Sombras', 'Divine Dog', 'Nue']),
  ('Nobara Kugisaki', 'Jujutsu Kaisen', 'https://upload.wikimedia.org/wikipedia/en/4/44/Nobara_Kugisaki.png', '159 cm', '2018', '16', 'Grado 1', ARRAY['Straw Doll Technique', 'Resonance', 'Hairpin']),
  ('Satoru Gojo', 'Jujutsu Kaisen', 'https://upload.wikimedia.org/wikipedia/en/5/59/Gojo_Satoru.png', '190 cm', '2018', '28', 'Grado Especial', ARRAY['Six Eyes', 'Limitless', 'Infinity', 'Hollow Purple']),
  ('Ryomen Sukuna', 'Jujutsu Kaisen', 'https://upload.wikimedia.org/wikipedia/en/3/3a/Ryomen_Sukuna.png', '173 cm', '2018', 'Desconocida (+1000 años)', 'Grado Especial', ARRAY['Dismantle', 'Cleave', 'Fuga de Fuego', 'Malevolent Shrine']),
  ('Kento Nanami', 'Jujutsu Kaisen', 'https://upload.wikimedia.org/wikipedia/en/8/85/Kento_Nanami.png', '188 cm', '2018', '28', 'Grado 1', ARRAY['Ratio Technique', 'Overtime']),
  ('Maki Zenin', 'Jujutsu Kaisen', 'https://upload.wikimedia.org/wikipedia/en/2/2a/Maki_Zenin.png', '168 cm', '2018', '17', 'Grado 1', ARRAY['Maestría en armas', 'Resistencia sobrehumana']),
  ('Aoi Todo', 'Jujutsu Kaisen', 'https://upload.wikimedia.org/wikipedia/en/6/6b/Aoi_Todo.png', '191 cm', '2018', '19', 'Grado 1', ARRAY['Boogie Woogie']),
  ('Toge Inumaki', 'Jujutsu Kaisen', 'https://upload.wikimedia.org/wikipedia/en/0/0b/Toge_Inumaki.png', '170 cm', '2018', '16', 'Semi-Grado 1', ARRAY['Cursed Speech']),
  ('Panda', 'Jujutsu Kaisen', 'https://upload.wikimedia.org/wikipedia/en/9/9e/Panda_%28Jujutsu_Kaisen%29.png', '227 cm', '2018', 'Desconocida', 'Grado 2', ARRAY['Cambio de núcleos (Gorila/Panda/Hermano menor)'])
ON CONFLICT DO NOTHING;
