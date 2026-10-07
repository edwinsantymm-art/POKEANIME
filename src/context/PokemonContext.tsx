import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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

  const fetchPokemon = useCallback(async (consulta: string) => {
    const valor = consulta.trim();
    if (!valor) {
      setError('Escribe el nombre o número del Pokémon.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const datos = await consultarPokemon(valor);
      setPokemon(datos);
    } catch (err) {
      setPokemon(null);
      setError(err instanceof Error ? err.message : 'Pokémon no encontrado');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let activa = true;
    consultarPokemon(POKEMON_INICIAL)
      .then((datos) => {
        if (activa) setPokemon(datos);
      })
      .catch((err: unknown) => {
        if (activa) {
          setPokemon(null);
          setError(err instanceof Error ? err.message : 'Pokémon no encontrado');
        }
      })
      .finally(() => {
        if (activa) setLoading(false);
      });

    return () => {
      activa = false;
    };
  }, []);

  const handleSearch = useCallback(() => {
    fetchPokemon(searchText || POKEMON_INICIAL);
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
