import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { usePokemon } from '@/context/PokemonContext';

const TRADUCCION_TIPOS: Record<string, string> = {
  normal: 'NORMAL',
  fire: 'FUEGO',
  water: 'AGUA',
  electric: 'ELÉCTRICO',
  grass: 'PLANTA',
  ice: 'HIELO',
  fighting: 'LUCHA',
  poison: 'VENENO',
  ground: 'TIERRA',
  flying: 'VOLADOR',
  psychic: 'PSÍQUICO',
  bug: 'BICHO',
  rock: 'ROCA',
  ghost: 'FANTASMA',
  dragon: 'DRAGÓN',
  dark: 'SINIESTRO',
  steel: 'ACERO',
  fairy: 'HADA',
};

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function PokemonCard() {
  const { pokemon, loading, error } = usePokemon();

  return (
    <View style={styles.card}>
      {pokemon && !loading && !error && (
        <View style={styles.headerRow}>
          <View style={styles.numberPill}>
            <Text style={styles.numberText}>#{pokemon.id}</Text>
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {capitalizar(pokemon.nombre)}
          </Text>
          <View style={styles.typePill}>
            <Text style={styles.typeText}>
              {TRADUCCION_TIPOS[pokemon.tipos[0]] ?? pokemon.tipos[0].toUpperCase()}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.imageWrapper}>
        <View style={styles.circleBg} />

        {loading && <ActivityIndicator size="large" color={colors.rosa} />}

        {!loading && !error && pokemon?.imagenPrincipal && (
          <Image source={{ uri: pokemon.imagenPrincipal }} style={styles.image} resizeMode="contain" />
        )}
      </View>

      {loading && <Text style={styles.loadingText}>Buscando Pokémon...</Text>}

      {!!error && !loading && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {pokemon && !loading && !error && (pokemon.imagenTrasera || pokemon.imagenShiny) && (
        <View style={styles.miniRow}>
          {pokemon.imagenTrasera && (
            <View style={styles.miniBox}>
              <Image source={{ uri: pokemon.imagenTrasera }} style={styles.miniImage} resizeMode="contain" />
            </View>
          )}
          {pokemon.imagenShiny && (
            <View style={styles.miniBox}>
              <Image source={{ uri: pokemon.imagenShiny }} style={styles.miniImage} resizeMode="contain" />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.blanco,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  numberPill: {
    backgroundColor: colors.rosaClaro,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  numberText: {
    color: colors.morado,
    fontWeight: '700',
    fontSize: 13,
  },
  name: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: colors.moradoOscuro,
  },
  typePill: {
    backgroundColor: colors.rosa,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typeText: {
    color: colors.blanco,
    fontWeight: '700',
    fontSize: 11,
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  circleBg: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.rosaClaro,
    opacity: 0.5,
  },
  image: {
    width: 190,
    height: 190,
  },
  loadingText: {
    textAlign: 'center',
    color: colors.morado,
    marginTop: 8,
  },
  errorBox: {
    backgroundColor: '#FDE8F3',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  errorText: {
    color: '#A80066',
    textAlign: 'center',
  },
  miniRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  miniBox: {
    backgroundColor: colors.fondo,
    borderRadius: 14,
    padding: 6,
  },
  miniImage: {
    width: 56,
    height: 56,
  },
});
