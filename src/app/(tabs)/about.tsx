import DescriptionCard from '@/assets/components/DescriptionCard';
import MovesList from '@/assets/components/MovesList';
import StatsRow from '@/assets/components/StatsRow';
import { usePokemon } from '@/context/PokemonContext';
import { colors } from '@/styles/colors';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function AboutScreen() {
  const { pokemon, loading, error } = usePokemon();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.rosa} />
        <Text style={styles.loadingText}>Buscando Pokémon...</Text>
      </View>
    );
  }

  if (!pokemon) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error || 'Busca un Pokémon en Inicio para ver sus datos aquí.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.name}>
        #{pokemon.id} {capitalizar(pokemon.nombre)}
      </Text>

      <StatsRow altura={pokemon.altura} peso={pokemon.peso} habilidad={pokemon.habilidad} />
      <DescriptionCard texto={pokemon.descripcion} />
      <MovesList movimientos={pokemon.movimientos} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  content: {
    padding: 16,
  },
  center: {
    flex: 1,
    backgroundColor: colors.fondo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.moradoOscuro,
  },
  loadingText: {
    color: colors.morado,
    marginTop: 10,
  },
  errorText: {
    color: colors.texto,
    textAlign: 'center',
  },
});
