import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';

type Props = {
  icono: string;
  titulo: string;
  descripcion: string;
};

export default function ServiceCard({ icono, titulo, descripcion }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.icono}>{icono}</Text>
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.descripcion}>{descripcion}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blanco,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  icono: {
    fontSize: 26,
    marginRight: 12,
  },
  textos: {
    flex: 1,
  },
  titulo: {
    fontWeight: '700',
    color: colors.moradoOscuro,
    fontSize: 15,
    marginBottom: 2,
  },
  descripcion: {
    color: colors.texto,
    fontSize: 13,
  },
});
