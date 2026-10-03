import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/styles/colors';

type Props = {
  altura: number;
  peso: number;
  habilidad: string;
};

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1).replace(/-/g, ' ');
}

export default function StatsRow({ altura, peso, habilidad }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.item}>
        <Ionicons name="resize-outline" size={18} color={colors.morado} />
        <Text style={styles.label}>Altura</Text>
        <Text style={styles.value}>{altura} m</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <Ionicons name="barbell-outline" size={18} color={colors.morado} />
        <Text style={styles.label}>Peso</Text>
        <Text style={styles.value}>{peso} kg</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <Ionicons name="sparkles-outline" size={18} color={colors.morado} />
        <Text style={styles.label}>Habilidad</Text>
        <Text style={styles.value} numberOfLines={1}>
          {capitalizar(habilidad)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.blanco,
    borderRadius: 18,
    paddingVertical: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  divider: {
    width: 1,
    backgroundColor: colors.rosaClaro,
  },
  label: {
    fontSize: 12,
    color: colors.morado,
    marginTop: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.texto,
    marginTop: 2,
  },
});
