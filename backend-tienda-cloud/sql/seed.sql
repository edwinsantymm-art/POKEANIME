INSERT INTO public.autopartes_productos (id, nombre, categoria, descripcion, precio)
VALUES
  ('bat-001', 'Batería Bosch S4 12V', 'Baterías', 'Batería libre de mantenimiento para automóvil.', 389900.00),
  ('fre-001', 'Pastillas de freno delanteras Brembo', 'Frenos', 'Juego de pastillas de freno para eje delantero.', 219900.00),
  ('ace-001', 'Aceite sintético Mobil 1 5W-30 (4 L)', 'Aceites', 'Aceite sintético para motores a gasolina.', 189900.00),
  ('fil-001', 'Filtro de aceite Mann-Filter', 'Filtros', 'Filtro de aceite para motor con filtración de alta eficiencia.', 35900.00),
  ('fil-002', 'Filtro de aire Bosch', 'Filtros', 'Filtro de aire para motor de combustión.', 52900.00),
  ('bat-002', 'Batería Varta Blue Dynamic 12V', 'Baterías', 'Batería de arranque para uso automotriz.', 429900.00),
  ('ace-002', 'Aceite Castrol GTX 10W-40 (4 L)', 'Aceites', 'Aceite multigrado para vehículos livianos.', 119900.00)
ON CONFLICT (id) DO NOTHING;
