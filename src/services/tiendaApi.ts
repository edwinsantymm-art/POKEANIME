import { TIENDA_SERVICE_URL, validarUrlServicio } from './config';

export type ProductoTienda = {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
};

export type ItemFactura = {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  total: number;
};

export type FacturaTienda = {
  numero: string;
  fecha: string;
  items: ItemFactura[];
  subtotal: number;
  iva: number;
  porcentajeIva: number;
  total: number;
  moneda: string;
};

export type UsuarioTienda = {
  id: string;
  nombre: string;
  correo: string;
};

export type SesionTienda = {
  token: string;
  usuario: UsuarioTienda;
};

type RespuestaProductos = { products: ProductoTienda[] };
type RespuestaFactura = { factura: FacturaTienda };
type RespuestaRegistro = { message: string };

async function solicitar<T>(
  ruta: string,
  init?: RequestInit,
  token?: string,
): Promise<T> {
  const serviceUrl = validarUrlServicio(TIENDA_SERVICE_URL, 'EXPO_PUBLIC_TIENDA_API_URL');
  let respuesta: Response;

  try {
    respuesta = await fetch(`${serviceUrl}${ruta}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new Error('No se pudo conectar con la tienda. Revisa tu conexión a Internet.');
  }

  let datos: unknown;
  try {
    datos = await respuesta.json();
  } catch {
    throw new Error('El microservicio de tienda devolvió una respuesta inválida.');
  }

  if (!respuesta.ok) {
    const mensaje =
      typeof datos === 'object' &&
      datos !== null &&
      'error' in datos &&
      typeof datos.error === 'string'
        ? datos.error
        : 'No se pudo completar la operación de la tienda.';
    throw new Error(mensaje);
  }

  return datos as T;
}

export function registrarUsuarioTienda(datos: {
  nombre: string;
  correo: string;
  contraseña: string;
}): Promise<RespuestaRegistro> {
  return solicitar<RespuestaRegistro>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export function iniciarSesionTienda(datos: {
  correo: string;
  contraseña: string;
}): Promise<SesionTienda> {
  return solicitar<SesionTienda>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export async function obtenerProductosTienda(token: string): Promise<ProductoTienda[]> {
  const datos = await solicitar<RespuestaProductos>('/api/tienda/productos', undefined, token);
  return datos.products;
}

export async function crearFacturaTienda(
  items: { id: string; cantidad: number }[],
  token: string,
): Promise<FacturaTienda> {
  const datos = await solicitar<RespuestaFactura>('/api/tienda/checkout', {
    method: 'POST',
    body: JSON.stringify({ items }),
  }, token);
  return datos.factura;
}
