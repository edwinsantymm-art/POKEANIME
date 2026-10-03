import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { coloresJJK } from '@/styles/colors';

type Props = {
  altura: string;
  anio: string;
  edad: string;
};

export default function JJKStatsRow({ altura, anio, edad }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.item}>
        <Ionicons name="resize-outline" size={18} color={coloresJJK.rojo} />
        <Text style={styles.label}>Altura</Text>
        <Text style={styles.value} numberOfLines={1}>
          {altura}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <Ionicons name="calendar-outline" size={18} color={coloresJJK.rojo} />
        <Text style={styles.label}>Año</Text>
        <Text style={styles.value} numberOfLines={1}>
          {anio}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <Ionicons name="person-outline" size={18} color={coloresJJK.rojo} />
        <Text style={styles.label}>Edad</Text>
        <Text style={styles.value} numberOfLines={1}>
          {edad}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: coloresJJK.blanco,
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
    backgroundColor: coloresJJK.rojoClaro,
  },
  label: {
    fontSize: 12,
    color: coloresJJK.rojo,
    marginTop: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: coloresJJK.texto,
    marginTop: 2,
  },
});
