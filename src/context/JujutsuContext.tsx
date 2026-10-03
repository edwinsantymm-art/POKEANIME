import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { consultarPersonaje, JJKCharacterData } from '@/services/jjkApi';

type JujutsuContextValue = {
  personaje: JJKCharacterData | null;
  loading: boolean;
  error: string;
  searchText: string;
  setSearchText: (texto: string) => void;
  handleSearch: () => void;
  handleClear: () => void;
};

const JujutsuContext = createContext<JujutsuContextValue | undefined>(undefined);

export function JujutsuProvider({ children }: { children: React.ReactNode }) {
  // Sin personaje por defecto: la app arranca vacía, solo se llena al buscar.
  const [personaje, setPersonaje] = useState<JJKCharacterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');

  const fetchPersonaje = useCallback(async (consulta: string) => {
    const valor = consulta.trim();
    if (!valor) {
      setError('Escribe el nombre del personaje.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const datos = await consultarPersonaje(valor);
      setPersonaje(datos);
    } catch (err) {
      setPersonaje(null);
      setError(err instanceof Error ? err.message : 'Personaje no encontrado');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(() => {
    fetchPersonaje(searchText);
  }, [fetchPersonaje, searchText]);

  const handleClear = useCallback(() => {
    setSearchText('');
    setError('');
    setPersonaje(null);
  }, []);

  const value = useMemo(
    () => ({ personaje, loading, error, searchText, setSearchText, handleSearch, handleClear }),
    [personaje, loading, error, searchText, handleSearch, handleClear],
  );

  return <JujutsuContext.Provider value={value}>{children}</JujutsuContext.Provider>;
}

export function useJujutsu() {
  const context = useContext(JujutsuContext);
  if (!context) {
    throw new Error('useJujutsu debe usarse dentro de <JujutsuProvider>');
  }
  return context;
}
