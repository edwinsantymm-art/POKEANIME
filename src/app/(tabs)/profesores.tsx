import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ProfesorCard from '@/assets/components/ProfesorCard';
import { colors } from '@/styles/colors';
import {
  actualizarProfesor,
  crearProfesor,
  eliminarProfesor,
  obtenerProfesor,
  obtenerProfesores,
  Profesor,
  ProfesorInput,
} from '@/services/profesoresApi';

const FORMULARIO_VACIO: ProfesorInput = {
  nombre: '',
  profesion: '',
  imagen: '',
  habilidades: [],
};

export default function ProfesoresScreen() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [formulario, setFormulario] = useState<ProfesorInput>(FORMULARIO_VACIO);
  const [habilidadesTexto, setHabilidadesTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [profesorConsultado, setProfesorConsultado] = useState<Profesor | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProfesores(await obtenerProfesores());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los profesores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let activa = true;
    obtenerProfesores()
      .then((datos) => {
        if (activa) setProfesores(datos);
      })
      .catch((err: unknown) => {
        if (activa) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar los profesores.');
        }
      })
      .finally(() => {
        if (activa) setLoading(false);
      });

    return () => {
      activa = false;
    };
  }, []);

  const profesoresFiltrados = useMemo(() => {
    if (profesorConsultado) return [profesorConsultado];
    const termino = busqueda.trim().toLocaleLowerCase();
    if (!termino) return profesores;
    return profesores.filter((profesor) =>
      `${profesor.id} ${profesor.nombre} ${profesor.profesion}`
        .toLocaleLowerCase()
        .includes(termino),
    );
  }, [busqueda, profesorConsultado, profesores]);

  function iniciarEdicion(profesor: Profesor) {
    setEditandoId(profesor.id);
    setFormulario({
      nombre: profesor.nombre,
      profesion: profesor.profesion,
      imagen: profesor.imagen ?? '',
      habilidades: profesor.habilidades ?? [],
    });
    setHabilidadesTexto((profesor.habilidades ?? []).join(', '));
    setMostrarFormulario(true);
    setError('');
  }

  function cerrarFormulario() {
    setMostrarFormulario(false);
    setEditandoId(null);
    setFormulario(FORMULARIO_VACIO);
    setHabilidadesTexto('');
  }

  async function guardarProfesor() {
    const nombre = formulario.nombre.trim();
    const profesion = formulario.profesion.trim();
    if (!nombre || !profesion) {
      setError('El nombre y la profesión son obligatorios.');
      return;
    }

    const datos: ProfesorInput = {
      nombre,
      profesion,
      imagen: formulario.imagen?.trim() || null,
      habilidades: habilidadesTexto
        .split(',')
        .map((habilidad) => habilidad.trim())
        .filter(Boolean),
    };

    setGuardando(true);
    setError('');
    try {
      if (editandoId === null) {
        await crearProfesor(datos);
      } else {
        await actualizarProfesor(editandoId, datos);
      }
      cerrarFormulario();
      setBusqueda('');
      setProfesorConsultado(null);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el profesor.');
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarEliminacion(profesor: Profesor) {
    Alert.alert(
      'Eliminar profesor',
      `¿Deseas eliminar a ${profesor.nombre}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setError('');
              try {
                await eliminarProfesor(profesor.id);
                setProfesorConsultado(null);
                await cargar();
              } catch (err) {
                setError(err instanceof Error ? err.message : 'No se pudo eliminar el profesor.');
              }
            })();
          },
        },
      ],
    );
  }

  async function consultarPorId() {
    const id = Number(busqueda.trim());
    if (!Number.isSafeInteger(id) || id <= 0) {
      setError('Escribe un ID numérico válido para consultar un profesor.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      setProfesorConsultado(await obtenerProfesor(id));
    } catch (err) {
      setProfesorConsultado(null);
      setError(err instanceof Error ? err.message : 'No se pudo consultar el profesor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Profesores</Text>
      <Text style={styles.subtitle}>Consulta y administra los registros de Neon.</Text>

      <View style={styles.searchRow}>
        <TextInput
          accessibilityLabel="Buscar por nombre o ID"
          style={[styles.input, styles.searchInput]}
          value={busqueda}
          onChangeText={(texto) => {
            setBusqueda(texto);
            setProfesorConsultado(null);
            setError('');
          }}
          placeholder="Buscar por nombre o ID"
          placeholderTextColor={colors.morado}
          returnKeyType="search"
          onSubmitEditing={() => {
            if (/^\d+$/.test(busqueda.trim())) void consultarPorId();
          }}
        />
        <Pressable style={styles.secondaryButton} onPress={() => void consultarPorId()}>
          <Text style={styles.secondaryButtonText}>Consultar ID</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => {
          if (mostrarFormulario) {
            cerrarFormulario();
          } else {
            setFormulario(FORMULARIO_VACIO);
            setEditandoId(null);
            setHabilidadesTexto('');
            setMostrarFormulario(true);
          }
        }}
      >
        <Text style={styles.primaryButtonText}>
          {mostrarFormulario ? 'Cancelar' : '＋ Agregar profesor'}
        </Text>
      </Pressable>

      {mostrarFormulario && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {editandoId === null ? 'Nuevo profesor' : `Editar profesor #${editandoId}`}
          </Text>
          <TextInput
            style={styles.input}
            value={formulario.nombre}
            onChangeText={(nombre) => setFormulario((actual) => ({ ...actual, nombre }))}
            placeholder="Nombre *"
            placeholderTextColor={colors.morado}
            maxLength={100}
          />
          <TextInput
            style={styles.input}
            value={formulario.profesion}
            onChangeText={(profesion) => setFormulario((actual) => ({ ...actual, profesion }))}
            placeholder="Profesión *"
            placeholderTextColor={colors.morado}
            maxLength={150}
          />
          <TextInput
            style={styles.input}
            value={formulario.imagen ?? ''}
            onChangeText={(imagen) => setFormulario((actual) => ({ ...actual, imagen }))}
            placeholder="URL de imagen (opcional)"
            placeholderTextColor={colors.morado}
            autoCapitalize="none"
            keyboardType="url"
          />
          <TextInput
            style={styles.input}
            value={habilidadesTexto}
            onChangeText={setHabilidadesTexto}
            placeholder="Habilidades separadas por comas"
            placeholderTextColor={colors.morado}
          />
          <Pressable
            style={[styles.primaryButton, guardando && styles.disabledButton]}
            onPress={() => void guardarProfesor()}
            disabled={guardando}
          >
            <Text style={styles.primaryButtonText}>
              {guardando ? 'Guardando...' : editandoId === null ? 'Crear profesor' : 'Guardar cambios'}
            </Text>
          </Pressable>
        </View>
      )}

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          {!profesores.length && (
            <Pressable style={styles.retryButton} onPress={() => void cargar()}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          )}
        </View>
      )}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.rosa} />
          <Text style={styles.loadingText}>Cargando profesores...</Text>
        </View>
      ) : (
        <>
          {profesorConsultado && (
            <Pressable
              style={styles.clearSearch}
              onPress={() => {
                setProfesorConsultado(null);
                setBusqueda('');
              }}
            >
              <Text style={styles.clearSearchText}>Mostrar todos los profesores</Text>
            </Pressable>
          )}

          {!profesoresFiltrados.length && (
            <Text style={styles.emptyText}>
              {busqueda ? 'No se encontraron profesores.' : 'No hay profesores registrados todavía.'}
            </Text>
          )}

          {profesoresFiltrados.map((profesor) => (
            <View key={profesor.id}>
              <ProfesorCard profesor={profesor} />
              <View style={styles.actions}>
                <Pressable style={styles.editButton} onPress={() => iniciarEdicion(profesor)}>
                  <Text style={styles.editButtonText}>Editar</Text>
                </Pressable>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => void confirmarEliminacion(profesor)}
                >
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </>
      )}
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.moradoOscuro,
  },
  subtitle: {
    color: colors.morado,
    marginTop: 4,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.rosaClaro,
    borderRadius: 12,
    backgroundColor: colors.blanco,
    color: colors.texto,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.rosa,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: colors.blanco,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.moradoOscuro,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    color: colors.blanco,
    fontWeight: '700',
    fontSize: 12,
  },
  formCard: {
    backgroundColor: colors.blanco,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  formTitle: {
    color: colors.moradoOscuro,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.65,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: -8,
    marginBottom: 16,
  },
  editButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.morado,
    borderRadius: 12,
    paddingVertical: 11,
  },
  editButtonText: {
    color: colors.blanco,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#B3261E',
    borderRadius: 12,
    paddingVertical: 11,
  },
  deleteButtonText: {
    color: colors.blanco,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#F8DDDD',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: '#7A1712',
    textAlign: 'center',
  },
  retryButton: {
    alignSelf: 'center',
    marginTop: 10,
    padding: 8,
  },
  retryText: {
    color: colors.moradoOscuro,
    fontWeight: '700',
  },
  loading: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: colors.morado,
    marginTop: 10,
  },
  emptyText: {
    color: colors.texto,
    textAlign: 'center',
    padding: 20,
  },
  clearSearch: {
    alignSelf: 'center',
    padding: 10,
    marginBottom: 8,
  },
  clearSearchText: {
    color: colors.morado,
    fontWeight: '700',
  },
});
