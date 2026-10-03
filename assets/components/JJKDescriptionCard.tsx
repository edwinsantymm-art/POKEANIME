import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { coloresJJK } from '@/styles/colors';

type Props = {
  texto: string;
  titulo?: string;
};

export default function JJKDescriptionCard({ texto, titulo = 'Descripción' }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Ionicons name="document-text-outline" size={18} color={coloresJJK.rojoOscuro} />
        <Text style={styles.title}>{titulo}</Text>
      </View>
      <Text style={styles.text}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: coloresJJK.rojoClaro,
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
    color: coloresJJK.rojoOscuro,
    fontSize: 15,
  },
  text: {
    color: coloresJJK.texto,
    fontSize: 14,
    lineHeight: 20,
  },
});
