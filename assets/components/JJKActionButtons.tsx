import { View, Text, Pressable, StyleSheet } from 'react-native';
import { coloresJJK } from '@/styles/colors';
import { useJujutsu } from '@/context/JujutsuContext';

export default function JJKActionButtons() {
  const { handleSearch, handleClear } = useJujutsu();

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
    backgroundColor: coloresJJK.rojo,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buscarText: {
    color: coloresJJK.blanco,
    fontWeight: '700',
    fontSize: 16,
  },
  limpiar: {
    backgroundColor: coloresJJK.blanco,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: coloresJJK.rojoClaro,
  },
  limpiarText: {
    color: coloresJJK.rojo,
    fontWeight: '700',
    fontSize: 15,
  },
});
