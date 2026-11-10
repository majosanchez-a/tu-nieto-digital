import type { Articulo, Categoria, Horario } from './tipos';

const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
export const dinero = (n: number) => pesos.format(n);

export function precioVisible(a: Pick<Articulo, 'precio' | 'precio_minimo'>) {
  if (a.precio != null) return dinero(a.precio);
  return `Desde ${dinero(a.precio_minimo ?? 0)}`;
}

export const aportacionDe = (precio: number, porcentaje: number) => Math.round((precio * porcentaje) / 100);

// La base de datos aún no tiene columna de categoría: se deriva del tipo y del slug (pendiente documentado).
export function categoriaDe(a: Pick<Articulo, 'slug' | 'tipo'>): Categoria {
  if (a.tipo === 'aportacion') return 'comunidad';
  if (a.slug === 'taller-para-empresas') return 'empresa';
  return 'familia';
}

export const CATEGORIAS: { clave: Categoria; nombre: string; descripcion: string }[] = [
  { clave: 'familia', nombre: 'Para mi familia', descripcion: 'Kit y sesiones para proteger a tus papás y abuelos.' },
  { clave: 'empresa', nombre: 'Para mi empresa', descripcion: 'Talleres para tu equipo o tus clientes mayores.' },
  { clave: 'comunidad', nombre: 'Apoyar a la comunidad', descripcion: 'Patrocina un taller gratuito en una colonia.' },
];

const MODALIDAD: Record<Horario['modalidad'], string> = {
  domicilio: 'a domicilio',
  videollamada: 'por videollamada',
  instalaciones_cliente: 'en tus instalaciones',
};

export function textoHorario(h: Horario) {
  const fecha = new Date(h.inicio).toLocaleString('es-MX', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City',
  });
  return `${fecha} · ${MODALIDAD[h.modalidad]}`;
}

export const etiquetaTipo: Record<Articulo['tipo'], string> = {
  producto: 'Producto físico',
  servicio: 'Servicio',
  aportacion: 'Aportación',
};

// Imagen local y texto alternativo por artículo (la columna imagen_url aún está vacía en la base).
export const IMAGENES: Record<string, { src: string; alt: string }> = {
  'kit-tu-nieto-digital': { src: '/productos/kit-seguridad-digital-adultos-mayores.png', alt: 'Kit Tu Nieto Digital: guía impresa, tarjetas de práctica y celular protegido con un escudo' },
  'sesion-personalizada': { src: '/productos/sesion-personalizada-celular-en-casa.png', alt: 'Sesión personalizada: un nieto configura el celular de su abuela en casa' },
  'taller-para-empresas': { src: '/productos/taller-seguridad-digital-para-empresas.png', alt: 'Taller para empresas: grupo aprendiendo seguridad digital frente a una pantalla' },
  'regala-un-taller': { src: '/productos/regala-un-taller-comunitario.png', alt: 'Regala un taller: corazón sobre una colonia que recibe un taller gratuito' },
};
export const imagenDe = (slug: string) => IMAGENES[slug] ?? { src: '/productos/kit-seguridad-digital-adultos-mayores.png', alt: 'Artículo de Tu Nieto Digital' };
