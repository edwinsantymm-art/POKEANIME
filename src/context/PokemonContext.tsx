import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { consultarPokemon, PokedexData } from '@/services/pokeApi';

type PokemonContextValue = {
  pokemon: PokedexData | null;
  loading: boolean;
  error: string;
  searchText: string;
  setSearchText: (texto: string) => void;
  handleSearch: () => void;
  handleClear: () => void;
};

const PokemonContext = createContext<PokemonContextValue | undefined>(undefined);

const POKEMON_INICIAL = 'mew';

export function PokemonProvider({ children }: { children: React.ReactNode }) {
  const [pokemon, setPokemon] = useState<PokedexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const requestId = useRef(0);

  const fetchPokemon = useCallback(async (consulta: string) => {
    const currentRequestId = ++requestId.current;
    const valor = consulta.trim();
    if (!valor) {
      setError('Escribe el nombre o número del Pokémon.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const datos = await consultarPokemon(valor);
      if (currentRequestId !== requestId.current) return;
      setPokemon(datos);
    } catch (err) {
      if (currentRequestId !== requestId.current) return;
      setPokemon(null);
      setError(err instanceof Error ? err.message : 'Pokémon no encontrado');
    } finally {
      if (currentRequestId === requestId.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    consultarPokemon(POKEMON_INICIAL)
      .then((datos) => {
        if (currentRequestId === requestId.current) {
          setPokemon(datos);
        }
      })
      .catch((err: unknown) => {
        if (currentRequestId === requestId.current) {
          setPokemon(null);
          setError(err instanceof Error ? err.message : 'Pokémon no encontrado');
        }
      })
      .finally(() => {
        if (currentRequestId === requestId.current) {
          setLoading(false);
        }
      });

    return () => {
      requestId.current += 1;
    };
  }, []);

  const handleSearch = useCallback(() => {
    fetchPokemon(searchText.trim() || POKEMON_INICIAL);
  }, [fetchPokemon, searchText]);

  const handleClear = useCallback(() => {
    setSearchText('');
    setError('');
    fetchPokemon(POKEMON_INICIAL);
  }, [fetchPokemon]);

  const value = useMemo(
    () => ({ pokemon, loading, error, searchText, setSearchText, handleSearch, handleClear }),
    [pokemon, loading, error, searchText, handleSearch, handleClear],
  );

  return <PokemonContext.Provider value={value}>{children}</PokemonContext.Provider>;
}

export function usePokemon() {
  const context = useContext(PokemonContext);
  if (!context) {
    throw new Error('usePokemon debe usarse dentro de <PokemonProvider>');
  }
  return context;
}
