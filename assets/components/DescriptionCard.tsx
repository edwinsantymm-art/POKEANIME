import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/styles/colors';

export default function DescriptionCard({ texto }: { texto: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Ionicons name="document-text-outline" size={18} color={colors.moradoOscuro} />
        <Text style={styles.title}>Descripción</Text>
      </View>
      <Text style={styles.text}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.rosaClaro,
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontWeight: '700',
    color: colors.moradoOscuro,
    fontSize: 15,
  },
  text: {
    color: colors.texto,
    fontSize: 14,
    lineHeight: 20,
  },
});
