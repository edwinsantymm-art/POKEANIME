import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import ProfesorCard from '@/assets/components/ProfesorCard';
import { colors } from '@/styles/colors';
import { obtenerProfesores, Profesor } from '@/services/profesoresApi';

export default function ProfesoresScreen() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const datos = await obtenerProfesores();
      setProfesores(datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los profesores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.rosa} />
        <Text style={styles.loadingText}>Cargando profesores...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={cargar}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Profesores</Text>

      {profesores.length === 0 && (
        <Text style={styles.errorText}>No hay profesores registrados todavía.</Text>
      )}

      {profesores.map((profesor) => (
        <ProfesorCard key={profesor.id} profesor={profesor} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    backgroundColor: colors.fondo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.moradoOscuro,
    marginBottom: 16,
  },
  loadingText: {
    color: colors.morado,
    marginTop: 10,
  },
  errorText: {
    color: colors.texto,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: colors.rosa,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  retryText: {
    color: colors.blanco,
    fontWeight: '700',
  },
});
