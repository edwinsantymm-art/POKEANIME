import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { usePokemon } from '@/context/PokemonContext';

export default function ActionButtons() {
  const { handleSearch, handleClear } = usePokemon();

  return (
    <View style={styles.row}>
      <Pressable style={styles.buscar} onPress={handleSearch}>
        <Text style={styles.buscarText}>🔍  Buscar</Text>
      </Pressable>
      <Pressable style={styles.limpiar} onPress={handleClear}>
        <Text style={styles.limpiarText}>Limpiar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 16,
    gap: 10,
  },
  buscar: {
    backgroundColor: colors.rosa,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buscarText: {
    color: colors.blanco,
    fontWeight: '700',
    fontSize: 16,
  },
  limpiar: {
    backgroundColor: colors.blanco,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.rosaClaro,
  },
  limpiarText: {
    color: colors.morado,
    fontWeight: '700',
    fontSize: 15,
  },
});
