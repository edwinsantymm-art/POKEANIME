import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AI_CHAT_SERVICE_URL, validarUrlServicio } from '@/services/config';
import { colors } from '@/styles/colors';

const RESPUESTA_NO_ENCONTRADA = 'Información no encontrada en la base de datos.';
const TIEMPOS_ESPERA_SEGUNDOS = [20, 40, 80, 160] as const;
type ServicioIA = 'gemini' | 'openai' | 'deepseek';
type OpcionServicioIA = {
  id: ServicioIA;
  name: string;
  model: string;
  configured: boolean;
};

function esServicioIA(value: unknown): value is ServicioIA {
  return value === 'gemini' || value === 'openai' || value === 'deepseek';
}

export default function ChatScreen() {
  const [pregunta, setPregunta] = useState('');
  const [tiempoEspera, setTiempoEspera] =
    useState<(typeof TIEMPOS_ESPERA_SEGUNDOS)[number]>(20);
  const [servicioIA, setServicioIA] = useState<ServicioIA>('gemini');
  const [respuesta, setRespuesta] = useState('');
  const [fuente, setFuente] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [serviciosDisponibles, setServiciosDisponibles] = useState<OpcionServicioIA[]>([]);
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [errorServicios, setErrorServicios] = useState('');

  useEffect(() => {
    let activo = true;

    async function cargarServicios() {
      try {
        const serviceUrl = validarUrlServicio(
          AI_CHAT_SERVICE_URL,
          'EXPO_PUBLIC_AI_CHAT_API_URL',
        );
        const response = await fetch(`${serviceUrl}/providers`);
        if (!response.ok) {
          throw new Error('No se pudieron obtener los proveedores del backend.');
        }
        const data: unknown = await response.json();
        if (
          typeof data !== 'object' ||
          data === null ||
          !('providers' in data) ||
          !Array.isArray(data.providers)
        ) {
          throw new Error('El backend devolvió una lista de proveedores inválida.');
        }

        const disponibles = data.providers.filter(
          (provider): provider is OpcionServicioIA =>
            typeof provider === 'object' &&
            provider !== null &&
            'id' in provider &&
            esServicioIA(provider.id) &&
            'name' in provider &&
            typeof provider.name === 'string' &&
            'model' in provider &&
            typeof provider.model === 'string' &&
            'configured' in provider &&
            typeof provider.configured === 'boolean',
        );
        if (activo) {
          setServiciosDisponibles(disponibles);
          const configurados = disponibles.filter((provider) => provider.configured);
          if (configurados.length > 0) {
            setServicioIA((seleccionado) =>
              configurados.some((provider) => provider.id === seleccionado)
                ? seleccionado
                : configurados[0].id,
            );
          }
        }
      } catch (cause) {
        if (activo) {
          setErrorServicios(
            cause instanceof Error
              ? cause.message
              : 'No se pudo conectar con el servicio de preguntas.',
          );
        }
      } finally {
        if (activo) setCargandoServicios(false);
      }
    }

    void cargarServicios();
    return () => {
      activo = false;
    };
  }, []);

  async function enviarPregunta() {
    const preguntaLimpia = pregunta.trim();
    if (!preguntaLimpia) {
      setError('Escribe una pregunta antes de enviarla.');
      return;
    }

    setCargando(true);
    setError('');
    setRespuesta('');
    setFuente('');
    const tiempoEsperaActual = tiempoEspera;
    const servicioIAActual = servicioIA;
    const controller = new AbortController();
    let tiempoAgotado = false;
    let temporizador: ReturnType<typeof setTimeout> | undefined;

    try {
      const serviceUrl = validarUrlServicio(
        AI_CHAT_SERVICE_URL,
        'EXPO_PUBLIC_AI_CHAT_API_URL',
      );
      temporizador = setTimeout(() => {
        tiempoAgotado = true;
        controller.abort();
      }, tiempoEsperaActual * 1000);
      const response = await fetch(`${serviceUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: preguntaLimpia,
          aiService: servicioIAActual,
        }),
        signal: controller.signal,
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        let message =
          typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string'
            ? data.error
            : 'No se pudo completar la consulta.';
        if (/schema\.sql|ai_chat_pokemones|ai_chat_animes/i.test(message)) {
          message =
            'El backend está desactualizado: ya no se necesita sql/schema.sql. Reinícialo o vuelve a desplegarlo para usar public.pokemons y public.personajes_anime.';
        }
        throw new Error(message);
      }

      if (
        typeof data !== 'object' ||
        data === null ||
        !('answer' in data) ||
        typeof data.answer !== 'string'
      ) {
        throw new Error('El servidor devolvió una respuesta inválida.');
      }

      setRespuesta(data.answer || RESPUESTA_NO_ENCONTRADA);
      if ('source' in data && typeof data.source === 'string') {
        setFuente(data.source);
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '';
      if (tiempoAgotado) {
        setError(
          `La app dejó de esperar después de ${tiempoEsperaActual} segundos. Elige un límite mayor e inténtalo de nuevo.`,
        );
      } else if (/failed to fetch|network request failed|connectexception|econnrefused/i.test(message)) {
        setError(
          'No se puede conectar con el backend. Ejecuta npm start desde la computadora, conecta el teléfono a la misma red Wi-Fi y permite Node.js en la red privada del firewall.',
        );
      } else {
        setError(
          cause instanceof Error
            ? cause.message
            : 'No se pudo conectar con el servicio de preguntas.',
        );
      }
    } finally {
      if (temporizador !== undefined) clearTimeout(temporizador);
      setCargando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Pregunta a la base de datos</Text>
        <Text style={styles.subtitle}>
          Consulta información de los Pokémon y animes registrados.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Tiempo máximo de espera</Text>
          <Text style={styles.settingHint}>
            La app dejará de esperar si el backend no responde dentro del límite.
          </Text>
          <View style={styles.optionsRow}>
            {TIEMPOS_ESPERA_SEGUNDOS.map((segundos) => {
              const seleccionado = tiempoEspera === segundos;
              return (
                <Pressable
                  key={segundos}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: seleccionado, disabled: cargando }}
                  style={[
                    styles.option,
                    seleccionado && styles.optionSelected,
                    cargando && styles.optionDisabled,
                  ]}
                  onPress={() => setTiempoEspera(segundos)}
                  disabled={cargando}
                >
                  <Text
                    style={[
                      styles.optionText,
                      seleccionado && styles.optionTextSelected,
                    ]}
                  >
                    {segundos} s
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, styles.serviceLabel]}>
            Servicio de inteligencia artificial
          </Text>
          {cargandoServicios ? (
            <ActivityIndicator color={colors.moradoOscuro} />
          ) : serviciosDisponibles.length ? (
            <View style={styles.optionsRow}>
              {serviciosDisponibles.map((servicio) => {
                const seleccionado = servicioIA === servicio.id;
                const deshabilitado = cargando || !servicio.configured;
                return (
                  <Pressable
                    key={servicio.id}
                    accessibilityRole="radio"
                    accessibilityLabel={
                      servicio.configured
                        ? `${servicio.name}, modelo ${servicio.model}`
                        : `${servicio.name}, requiere configurar su clave en el backend`
                    }
                    accessibilityState={{ checked: seleccionado, disabled: deshabilitado }}
                    style={[
                      styles.option,
                      seleccionado && styles.optionSelected,
                      deshabilitado && styles.optionDisabled,
                    ]}
                    onPress={() => setServicioIA(servicio.id)}
                    disabled={deshabilitado}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        seleccionado && styles.optionTextSelected,
                      ]}
                    >
                      {servicio.configured
                        ? servicio.name
                        : `${servicio.name} · Configurar`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text style={styles.providerError}>
              {errorServicios || 'No hay proveedores de IA configurados en el backend.'}
            </Text>
          )}
          {!cargandoServicios && serviciosDisponibles.some((servicio) => !servicio.configured) ? (
            <Text style={styles.settingHint}>
              Para habilitar los demás, configura sus API keys como secretos en el backend y reinícialo.
            </Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Tu pregunta</Text>
          <TextInput
            accessibilityLabel="Pregunta para la base de datos"
            style={styles.input}
            value={pregunta}
            onChangeText={setPregunta}
            placeholder="Ej.: ¿Qué tipo es Pikachu?"
            placeholderTextColor={colors.morado}
            multiline
            maxLength={500}
            editable={!cargando}
            textAlignVertical="top"
            returnKeyType="send"
            onSubmitEditing={() => void enviarPregunta()}
          />
          <Text style={styles.counter}>{pregunta.length}/500</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: cargando }}
            style={({ pressed }) => [
              styles.button,
              (pressed || cargando) && styles.buttonPressed,
            ]}
            onPress={() => void enviarPregunta()}
            disabled={cargando || cargandoServicios || serviciosDisponibles.length === 0}
          >
            {cargando ? (
              <ActivityIndicator color={colors.blanco} />
            ) : (
              <Text style={styles.buttonText}>Enviar pregunta</Text>
            )}
          </Pressable>
        </View>

        {(Boolean(respuesta) || Boolean(error) || cargando) && (
          <View style={styles.answerCard} accessibilityLiveRegion="polite">
            <Text style={styles.answerTitle}>Respuesta</Text>
            {cargando ? (
              <Text style={styles.answerText}>Consultando Neon y Gemini...</Text>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <>
                <Text style={styles.answerText}>{respuesta}</Text>
                {fuente ? <Text style={styles.sourceText}>Fuente: {fuente}</Text> : null}
              </>
            )}
          </View>
        )}

        <Text style={styles.note}>
          Para Pokémon registrados, Gemini también puede complementar los datos de Neon con su conocimiento general.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    color: colors.moradoOscuro,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.morado,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.blanco,
    borderColor: colors.rosaClaro,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  label: {
    color: colors.moradoOscuro,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  settingHint: {
    color: colors.morado,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  providerError: {
    color: '#9D2424',
    fontSize: 14,
    lineHeight: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.fondo,
    borderColor: colors.rosaClaro,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 62,
    paddingHorizontal: 14,
  },
  optionSelected: {
    backgroundColor: colors.moradoOscuro,
    borderColor: colors.moradoOscuro,
  },
  optionDisabled: {
    opacity: 0.65,
  },
  optionText: {
    color: colors.moradoOscuro,
    fontSize: 14,
    fontWeight: '700',
  },
  optionTextSelected: {
    color: colors.blanco,
  },
  serviceLabel: {
    marginTop: 18,
  },
  input: {
    backgroundColor: colors.fondo,
    borderColor: colors.rosaClaro,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.texto,
    fontSize: 16,
    minHeight: 108,
    padding: 12,
  },
  counter: {
    color: colors.morado,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.moradoOscuro,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 14,
    paddingHorizontal: 16,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: colors.blanco,
    fontSize: 16,
    fontWeight: '700',
  },
  answerCard: {
    backgroundColor: colors.blanco,
    borderColor: colors.rosaClaro,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 20,
    padding: 16,
  },
  answerTitle: {
    color: colors.moradoOscuro,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },
  answerText: {
    color: colors.texto,
    fontSize: 16,
    lineHeight: 24,
  },
  sourceText: {
    color: colors.morado,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  errorText: {
    color: '#9D2424',
    fontSize: 15,
    lineHeight: 22,
  },
  note: {
    color: colors.morado,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 20,
    textAlign: 'center',
  },
});
