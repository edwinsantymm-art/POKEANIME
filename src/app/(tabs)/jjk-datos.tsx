import { ScrollView, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import JJKStatsRow from '@/assets/components/JJKStatsRow';
import JJKDescriptionCard from '@/assets/components/JJKDescriptionCard';
import JJKGradoCard from '@/assets/components/JJKGradoCard';
import { coloresJJK } from '@/styles/colors';
import { useJujutsu } from '@/context/JujutsuContext';

export default function JujutsuDatosScreen() {
  const { personaje, loading, error } = useJujutsu();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={coloresJJK.rojo} />
        <Text style={styles.loadingText}>Buscando personaje...</Text>
      </View>
    );
  }

  if (!personaje) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error || 'Busca un personaje en la pestaña Jujutsu Kaisen para ver sus datos aquí.'}
        </Text>
      </View>
    );
  }

  const textoFamiliares = personaje.familiares.length
    ? personaje.familiares.join('\n')
    : 'No hay familiares registrados para este personaje.';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.name}>
        #{personaje.id} {personaje.nombre}
      </Text>

      <JJKStatsRow altura={personaje.altura} anio={personaje.anio} edad={personaje.edad} />
      <JJKDescriptionCard texto={textoFamiliares} titulo="Familiares" />
      <JJKGradoCard grado={personaje.grado} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: coloresJJK.fondo,
  },
  content: {
    padding: 16,
  },
  center: {
    flex: 1,
    backgroundColor: coloresJJK.fondo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: coloresJJK.rojoOscuro,
  },
  loadingText: {
    color: coloresJJK.rojo,
    marginTop: 10,
  },
  errorText: {
    color: coloresJJK.texto,
    textAlign: 'center',
  },
});
