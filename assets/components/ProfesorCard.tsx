import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { Profesor } from '@/services/profesoresApi';

export default function ProfesorCard({ profesor }: { profesor: Profesor }) {
  return (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        {profesor.imagen ? (
          <Image source={{ uri: profesor.imagen }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {profesor.nombre.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.nombre}>{profesor.nombre}</Text>
      <Text style={[styles.profesion, !profesor.universidad && styles.profesionSinUniversidad]}>
        {profesor.profesion}
      </Text>
      {profesor.universidad && <Text style={styles.universidad}>{profesor.universidad}</Text>}

      {!!profesor.habilidades?.length && (
        <View style={styles.habilidades}>
          {profesor.habilidades.map((habilidad) => (
            <View key={habilidad} style={styles.pill}>
              <Text style={styles.pillText}>{habilidad}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.blanco,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  imageWrapper: {
    marginBottom: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.rosaClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.morado,
  },
  nombre: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.moradoOscuro,
    textAlign: 'center',
  },
  profesion: {
    fontSize: 14,
    color: colors.morado,
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'center',
  },
  profesionSinUniversidad: {
    marginBottom: 10,
  },
  universidad: {
    fontSize: 13,
    color: colors.texto,
    marginBottom: 10,
    textAlign: 'center',
  },
  habilidades: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
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
    fontSize: 12,
  },
});
