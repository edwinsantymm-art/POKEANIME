import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  crearFacturaTienda,
  FacturaTienda,
  iniciarSesionTienda,
  obtenerProductosTienda,
  ProductoTienda,
  registrarUsuarioTienda,
  SesionTienda,
} from '@/services/tiendaApi';
import { colors } from '@/styles/colors';

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 2,
});

function escaparHtml(valor: string): string {
  return valor.replace(/[&<>"']/g, (caracter) => {
    const entidades: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entidades[caracter];
  });
}

export default function TiendaScreen() {
  const [sesion, setSesion] = useState<SesionTienda | null>(null);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [autenticando, setAutenticando] = useState(false);
  const [productos, setProductos] = useState<ProductoTienda[]>([]);
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [factura, setFactura] = useState<FacturaTienda | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [comprando, setComprando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!sesion) return;
    let activa = true;
    obtenerProductosTienda(sesion.token)
      .then((catalogo) => {
        if (activa) setProductos(catalogo);
      })
      .catch((err: unknown) => {
        if (activa) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar los productos.');
        }
      })
      .finally(() => {
        if (activa) setCargando(false);
      });

    return () => {
      activa = false;
    };
  }, [sesion]);

  async function enviarCredenciales() {
    setAutenticando(true);
    setError('');
    setMensaje('');
    try {
      if (modoRegistro) {
        const resultado = await registrarUsuarioTienda({ nombre, correo, contraseña });
        setModoRegistro(false);
        setContraseña('');
        setMensaje(resultado.message);
      } else {
        const nuevaSesion = await iniciarSesionTienda({ correo, contraseña });
        setCargando(true);
        setSesion(nuevaSesion);
        setContraseña('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la autenticación.');
    } finally {
      setAutenticando(false);
    }
  }

  async function recargarProductos() {
    if (!sesion) return;
    setCargando(true);
    setError('');
    try {
      setProductos(await obtenerProductosTienda(sesion.token));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los productos.');
    } finally {
      setCargando(false);
    }
  }

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase();
    if (!termino) return productos;
    return productos.filter((producto) =>
      `${producto.nombre} ${producto.categoria} ${producto.descripcion}`
        .toLocaleLowerCase()
        .includes(termino),
    );
  }, [busqueda, productos]);

  const productosCarrito = useMemo(
    () =>
      productos
        .filter((producto) => (cantidades[producto.id] ?? 0) > 0)
        .map((producto) => ({ ...producto, cantidad: cantidades[producto.id] })),
    [cantidades, productos],
  );

  const subtotalCentavos = productosCarrito.reduce(
    (suma, producto) => suma + Math.round(producto.precio * 100) * producto.cantidad,
    0,
  );
  const ivaCentavos = Math.round((subtotalCentavos * 19) / 100);

  function cambiarCantidad(id: string, cambio: number) {
    setCantidades((actuales) => ({
      ...actuales,
      [id]: Math.min(99, Math.max(0, (actuales[id] ?? 0) + cambio)),
    }));
    setFactura(null);
  }

  async function pagarCarrito() {
    if (!sesion) return;
    setComprando(true);
    setError('');
    try {
      setFactura(
        await crearFacturaTienda(
          productosCarrito.map(({ id, cantidad }) => ({ id, cantidad })),
          sesion.token,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la compra.');
    } finally {
      setComprando(false);
    }
  }

  async function descargarComprobante() {
    if (!factura) return;

    try {
      const filas = factura.items
        .map(
          (item) => `
            <tr>
              <td>${escaparHtml(item.nombre)}<br><small>${item.cantidad} x ${formatoMoneda.format(item.precio)}</small></td>
              <td class="derecha">${formatoMoneda.format(item.total)}</td>
            </tr>`,
        )
        .join('');
      const html = `
        <html>
          <head><meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body { font-family: Arial, sans-serif; color: #242424; padding: 28px; }
              h1 { font-size: 22px; margin-bottom: 4px; }
              .detalle { color: #666; font-size: 12px; }
              table { width: 100%; border-collapse: collapse; margin-top: 24px; }
              td { border-bottom: 1px solid #e5e5e5; padding: 12px 4px; }
              .derecha { text-align: right; white-space: nowrap; }
              .totales { margin-top: 20px; text-align: right; line-height: 1.8; }
              .total { font-size: 18px; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Comprobante de compra</h1>
            <div class="detalle">Factura ${escaparHtml(factura.numero)}</div>
            <div class="detalle">${escaparHtml(new Date(factura.fecha).toLocaleString('es-CO'))}</div>
            <table><tbody>${filas}</tbody></table>
            <div class="totales">
              Subtotal: ${formatoMoneda.format(factura.subtotal)}<br />
              IVA (${factura.porcentajeIva}%): ${formatoMoneda.format(factura.iva)}<br />
              <span class="total">Total: ${formatoMoneda.format(factura.total)}</span>
            </div>
          </body>
        </html>`;

      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        return;
      }

      const archivo = await Print.printToFileAsync({ html });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('PDF generado', `El comprobante se guardó temporalmente en: ${archivo.uri}`);
        return;
      }
      await Sharing.shareAsync(archivo.uri, {
        mimeType: 'application/pdf',
        UTI: '.pdf',
        dialogTitle: 'Descargar o compartir comprobante',
      });
    } catch (err) {
      Alert.alert(
        'No se pudo generar el PDF',
        err instanceof Error ? err.message : 'Intenta nuevamente.',
      );
    }
  }

  function nuevaCompra() {
    setFactura(null);
    setCantidades({});
  }

  function cerrarSesion() {
    setSesion(null);
    setProductos([]);
    setCantidades({});
    setFactura(null);
    setBusqueda('');
    setError('');
    setMensaje('');
    setContraseña('');
  }

  if (!sesion) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.authContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
        </Text>
        <Text style={styles.subtitle}>
          {modoRegistro
            ? 'Regístrate para comprar autopartes.'
            : 'Ingresa para consultar la tienda y tus compras.'}
        </Text>

        {modoRegistro ? (
          <>
            <Text style={styles.fieldLabel}>Nombre</Text>
            <TextInput
              accessibilityLabel="Nombre"
              autoCapitalize="words"
              autoComplete="name"
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Tu nombre"
              placeholderTextColor={colors.morado}
              maxLength={80}
            />
          </>
        ) : null}
        <Text style={styles.fieldLabel}>Correo electrónico</Text>
        <TextInput
          accessibilityLabel="Correo electrónico"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          style={styles.input}
          value={correo}
          onChangeText={setCorreo}
          placeholder="correo@ejemplo.com"
          placeholderTextColor={colors.morado}
          maxLength={254}
        />
        <Text style={styles.fieldLabel}>Contraseña</Text>
        <TextInput
          accessibilityLabel="Contraseña"
          autoComplete={modoRegistro ? 'new-password' : 'current-password'}
          secureTextEntry
          style={styles.input}
          value={contraseña}
          onChangeText={setContraseña}
          placeholder={modoRegistro ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
          placeholderTextColor={colors.morado}
          maxLength={128}
        />

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {mensaje ? <Text accessibilityRole="alert" style={styles.success}>{mensaje}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={autenticando}
          style={[styles.primaryButton, autenticando && styles.disabledButton]}
          onPress={() => void enviarCredenciales()}
        >
          {autenticando ? (
            <ActivityIndicator color={colors.blanco} />
          ) : (
            <Text style={styles.primaryButtonText}>
              {modoRegistro ? 'Crear cuenta' : 'Entrar'}
            </Text>
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.secondaryButton}
          onPress={() => {
            setModoRegistro(!modoRegistro);
            setError('');
            setMensaje('');
          }}
        >
          <Text style={styles.secondaryButtonText}>
            {modoRegistro ? 'Ya tengo una cuenta · Iniciar sesión' : 'Crear una cuenta'}
          </Text>
        </Pressable>
        <Text style={styles.authHint}>
          Las cuentas se guardan en Neon. Usa el mismo correo y contraseña al volver a entrar.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerDetails}>
          <Text style={styles.title}>Tienda de autopartes</Text>
          <Text style={styles.subtitle}>Hola, {sesion.usuario.nombre}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={cerrarSesion}>
          <Text style={styles.secondaryButtonText}>Salir</Text>
        </Pressable>
      </View>

      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {factura ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Compra confirmada</Text>
          <Text style={styles.secondaryText}>Factura {factura.numero}</Text>
          <Text style={styles.secondaryText}>
            {new Date(factura.fecha).toLocaleString('es-CO')}
          </Text>
          {factura.items.map((item) => (
            <View key={item.id} style={styles.invoiceRow}>
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{item.nombre}</Text>
                <Text style={styles.secondaryText}>
                  {item.cantidad} x {formatoMoneda.format(item.precio)}
                </Text>
              </View>
              <Text style={styles.price}>{formatoMoneda.format(item.total)}</Text>
            </View>
          ))}
          <View style={styles.separator} />
          <TotalRow label="Subtotal" value={factura.subtotal} />
          <TotalRow label={`IVA (${factura.porcentajeIva}%)`} value={factura.iva} />
          <TotalRow label="Total" value={factura.total} destacado />
          <Pressable
            accessibilityRole="button"
            style={styles.primaryButton}
            onPress={() => void descargarComprobante()}
          >
            <Text style={styles.primaryButtonText}>Descargar comprobante en PDF</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={styles.secondaryButton}
            onPress={nuevaCompra}
          >
            <Text style={styles.secondaryButtonText}>Nueva compra</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <TextInput
            accessibilityLabel="Buscar autopartes"
            style={styles.input}
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por producto o categoría"
            placeholderTextColor={colors.morado}
            returnKeyType="search"
          />

          {cargando ? (
            <ActivityIndicator color={colors.morado} style={styles.loading} />
          ) : productos.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.secondaryText}>No hay productos para mostrar.</Text>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => void recargarProductos()}
              >
                <Text style={styles.secondaryButtonText}>Reintentar</Text>
              </Pressable>
            </View>
          ) : productosFiltrados.length === 0 ? (
            <Text style={styles.secondaryText}>No hay resultados para esa búsqueda.</Text>
          ) : (
            productosFiltrados.map((producto) => (
              <View key={producto.id} style={styles.productCard}>
                <View style={styles.productDetails}>
                  <Text style={styles.category}>{producto.categoria}</Text>
                  <Text style={styles.productName}>{producto.nombre}</Text>
                  <Text style={styles.secondaryText}>{producto.descripcion}</Text>
                  <Text style={styles.price}>{formatoMoneda.format(producto.precio)}</Text>
                </View>
                <View style={styles.quantityControls}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Quitar ${producto.nombre}`}
                    style={styles.quantityButton}
                    onPress={() => cambiarCantidad(producto.id, -1)}
                  >
                    <Text style={styles.quantityText}>−</Text>
                  </Pressable>
                  <Text style={styles.quantity}>{cantidades[producto.id] ?? 0}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Agregar ${producto.nombre}`}
                    style={styles.quantityButton}
                    onPress={() => cambiarCantidad(producto.id, 1)}
                  >
                    <Text style={styles.quantityText}>+</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>Tu carrito</Text>
          {productosCarrito.length === 0 ? (
            <Text style={styles.secondaryText}>Agrega productos para calcular el total.</Text>
          ) : (
            <View style={styles.card}>
              <TotalRow label="Subtotal" value={subtotalCentavos / 100} />
              <TotalRow label="IVA (19%)" value={ivaCentavos / 100} />
              <TotalRow label="Total" value={(subtotalCentavos + ivaCentavos) / 100} destacado />
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            disabled={comprando || productosCarrito.length === 0}
            style={[
              styles.primaryButton,
              (comprando || productosCarrito.length === 0) && styles.disabledButton,
            ]}
            onPress={() => void pagarCarrito()}
          >
            {comprando ? (
              <ActivityIndicator color={colors.blanco} />
            ) : (
              <Text style={styles.primaryButtonText}>Pagar y generar factura</Text>
            )}
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

function TotalRow({
  label,
  value,
  destacado = false,
}: {
  label: string;
  value: number;
  destacado?: boolean;
}) {
  return (
    <View style={styles.totalRow}>
      <Text style={destacado ? styles.totalLabel : styles.secondaryText}>{label}</Text>
      <Text style={destacado ? styles.totalValue : styles.price}>
        {formatoMoneda.format(value)}
      </Text>
    </View>
  );
}

// Estilos de pantalla, catálogo, carrito y factura.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  content: {
    padding: 18,
    paddingBottom: 36,
  },
  authContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerDetails: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: colors.texto,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 8,
  },
  subtitle: {
    color: colors.morado,
    fontSize: 14,
    marginBottom: 18,
    marginTop: 5,
  },
  input: {
    backgroundColor: colors.blanco,
    borderColor: colors.rosaClaro,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.texto,
    fontSize: 15,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  fieldLabel: {
    color: colors.texto,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 7,
  },
  authHint: {
    color: colors.morado,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  productCard: {
    alignItems: 'center',
    backgroundColor: colors.blanco,
    borderColor: colors.rosaClaro,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 11,
    padding: 14,
  },
  productDetails: {
    flex: 1,
    paddingRight: 10,
  },
  category: {
    color: colors.morado,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  productName: {
    color: colors.texto,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  secondaryText: {
    color: colors.morado,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  price: {
    color: colors.texto,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 7,
  },
  quantityControls: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  quantityButton: {
    alignItems: 'center',
    backgroundColor: colors.fondo,
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  quantityText: {
    color: colors.texto,
    fontSize: 21,
    lineHeight: 25,
  },
  quantity: {
    color: colors.texto,
    fontSize: 15,
    minWidth: 28,
    textAlign: 'center',
  },
  sectionTitle: {
    color: colors.texto,
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 15,
  },
  card: {
    backgroundColor: colors.blanco,
    borderColor: colors.rosaClaro,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
    padding: 15,
  },
  totalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalLabel: {
    color: colors.texto,
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    color: colors.texto,
    fontSize: 17,
    fontWeight: '700',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.morado,
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: colors.blanco,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 42,
  },
  secondaryButtonText: {
    color: colors.morado,
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loading: {
    marginVertical: 28,
  },
  error: {
    backgroundColor: '#FCEBE9',
    borderRadius: 8,
    color: '#8A3028',
    fontSize: 14,
    marginBottom: 12,
    padding: 12,
  },
  success: {
    backgroundColor: '#E8F4EA',
    borderRadius: 8,
    color: '#28623A',
    fontSize: 14,
    marginBottom: 12,
    padding: 12,
  },
  invoiceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  separator: {
    backgroundColor: colors.rosaClaro,
    height: 1,
    marginVertical: 10,
  },
});
