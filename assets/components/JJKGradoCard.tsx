import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { coloresJJK } from '@/styles/colors';

export default function JJKGradoCard({ grado }: { grado: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Ionicons name="ribbon-outline" size={18} color={coloresJJK.rojoOscuro} />
        <Text style={styles.title}>Grado</Text>
      </View>
      <Text style={styles.valor}>{grado}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: coloresJJK.rojoClaro,
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontWeight: '700',
    color: coloresJJK.rojoOscuro,
    fontSize: 15,
  },
  valor: {
    color: coloresJJK.texto,
    fontSize: 16,
    fontWeight: '700',
  },
});
