import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';

export default function MovesList({ movimientos }: { movimientos: string[] }) {
  if (!movimientos.length) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Movimientos</Text>
      <View style={styles.list}>
        {movimientos.map((movimiento) => (
          <View key={movimiento} style={styles.pill}>
            <Text style={styles.pillText}>{movimiento.replace(/-/g, ' ')}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.blanco,
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    color: colors.moradoOscuro,
    fontSize: 15,
    marginBottom: 10,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: colors.fondo,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.rosaClaro,
  },
  pillText: {
    color: colors.morado,
    fontSize: 13,
    textTransform: 'capitalize',
  },
});
