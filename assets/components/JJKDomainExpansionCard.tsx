import { View, Text, StyleSheet } from 'react-native';
import { coloresJJK } from '@/styles/colors';
import { JJKAbility } from '@/services/jjkApi';

export default function JJKDomainExpansionCard({ expansion }: { expansion: JJKAbility | null }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Expansión de Dominio</Text>

      {!expansion && (
        <Text style={styles.empty}>Este personaje no tiene expansión de dominio registrada.</Text>
      )}

      {!!expansion && (
        <>
          <Text style={styles.nombre}>{expansion.nombre}</Text>

          {!!expansion.tipo && <Text style={styles.meta}>Tipo: {expansion.tipo}</Text>}
          {!!expansion.alcance && <Text style={styles.meta}>Alcance: {expansion.alcance}</Text>}

          {!!expansion.descripcion && <Text style={styles.descripcion}>{expansion.descripcion}</Text>}
        </>
      )}
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
    borderWidth: 1,
    borderColor: coloresJJK.rojoClaro,
  },
  title: {
    fontWeight: '700',
    color: coloresJJK.rojoOscuro,
    fontSize: 15,
    marginBottom: 8,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '800',
    color: coloresJJK.rojo,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: coloresJJK.texto,
    marginBottom: 2,
  },
  descripcion: {
    fontSize: 14,
    color: coloresJJK.texto,
    marginTop: 8,
    lineHeight: 20,
  },
  empty: {
    fontSize: 13,
    color: coloresJJK.texto,
  },
});
