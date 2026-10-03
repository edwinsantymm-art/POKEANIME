import { View, Text, StyleSheet } from 'react-native';
import { coloresJJK } from '@/styles/colors';

export default function JJKAbilitiesList({ habilidades }: { habilidades: string[] }) {
  if (!habilidades.length) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Habilidades</Text>
      <View style={styles.list}>
        {habilidades.map((habilidad) => (
          <View key={habilidad} style={styles.pill}>
            <Text style={styles.pillText}>{habilidad}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: coloresJJK.blanco,
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    color: coloresJJK.rojoOscuro,
    fontSize: 15,
    marginBottom: 10,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: coloresJJK.fondo,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: coloresJJK.rojoClaro,
  },
  pillText: {
    color: coloresJJK.rojo,
    fontSize: 13,
  },
});
