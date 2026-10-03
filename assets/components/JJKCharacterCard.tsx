import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { coloresJJK } from '@/styles/colors';
import { useJujutsu } from '@/context/JujutsuContext';

export default function JJKCharacterCard() {
  const { personaje, loading, error } = useJujutsu();

  return (
    <View style={styles.card}>
      {personaje && !loading && !error && (
        <View style={styles.headerRow}>
          <View style={styles.numberPill}>
            <Text style={styles.numberText}>#{personaje.id}</Text>
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {personaje.nombre}
          </Text>
        </View>
      )}

      <View style={styles.imageWrapper}>
        <View style={styles.circleBg} />

        {loading && <ActivityIndicator size="large" color={coloresJJK.rojo} />}

        {!loading && !error && personaje?.imagen && (
          <Image source={{ uri: personaje.imagen }} style={styles.image} resizeMode="contain" />
        )}

        {!loading && !error && !personaje && (
          <Text style={styles.emptyText}>Escribe un nombre arriba y presiona buscar 🔎</Text>
        )}
      </View>

      {loading && <Text style={styles.loadingText}>Buscando personaje...</Text>}

      {!!error && !loading && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: coloresJJK.blanco,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  numberPill: {
    backgroundColor: coloresJJK.rojoClaro,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  numberText: {
    color: coloresJJK.rojo,
    fontWeight: '700',
    fontSize: 13,
  },
  name: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: coloresJJK.rojoOscuro,
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  circleBg: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: coloresJJK.rojoClaro,
    opacity: 0.6,
  },
  image: {
    width: 190,
    height: 190,
  },
  loadingText: {
    textAlign: 'center',
    color: coloresJJK.rojo,
    marginTop: 8,
  },
  errorBox: {
    backgroundColor: '#F8DDDD',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  errorText: {
    color: '#7A1712',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: coloresJJK.rojo,
    paddingHorizontal: 20,
  },
});
