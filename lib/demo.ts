import type { Articulo } from './tipos';

// Datos de DEMOSTRACIÓN: los mismos del script 03_datos_de_prueba.sql.
// Solo se usan cuando Supabase no está configurado (por ejemplo, al revisar el código sin llaves).
export const ARTICULOS_DEMO: Articulo[] = [
  {
    id: 'demo-kit', slug: 'kit-tu-nieto-digital', nombre: 'Kit Tu Nieto Digital', tipo: 'producto',
    descripcion: 'Material para reconocer y evitar estafas por WhatsApp, llamadas y redes sociales.',
    incluye: ['Guía impresa con las reglas clave', 'Tarjetas para practicar «¿Es estafa o no?»', 'Acceso al curso en línea', 'Código QR de acceso'],
    precio: 400, precio_minimo: null, duracion_min: null, cupo_maximo: null, porcentaje_aportacion: 30,
    variantes: [{ id: 'demo-android', nombre: 'Android', existencias: 10 }, { id: 'demo-iphone', nombre: 'iPhone', existencias: 10 }],
    horarios: [],
  },
  {
    id: 'demo-sesion', slug: 'sesion-personalizada', nombre: 'Sesión personalizada', tipo: 'servicio',
    descripcion: 'Configuramos su celular y le enseñamos, a domicilio o por videollamada.',
    incluye: ['Configuración de seguridad del celular', 'Práctica con el simulador'],
    precio: 350, precio_minimo: null, duracion_min: 60, cupo_maximo: 1, porcentaje_aportacion: 30, variantes: [],
    horarios: [
      { id: 'demo-h1', inicio: '2026-11-14T16:00:00Z', fin: '2026-11-14T17:00:00Z', modalidad: 'domicilio' },
      { id: 'demo-h2', inicio: '2026-11-14T18:00:00Z', fin: '2026-11-14T19:00:00Z', modalidad: 'videollamada' },
    ],
  },
  {
    id: 'demo-taller', slug: 'taller-para-empresas', nombre: 'Taller para empresas', tipo: 'servicio',
    descripcion: 'Capacitación en seguridad digital en las instalaciones del cliente.',
    incluye: ['Taller presencial', 'Material para participantes'],
    precio: 3000, precio_minimo: null, duracion_min: 120, cupo_maximo: 20, porcentaje_aportacion: 30, variantes: [], horarios: [],
  },
  {
    id: 'demo-regala', slug: 'regala-un-taller', nombre: 'Regala un taller', tipo: 'aportacion',
    descripcion: 'Patrocinio total o parcial de un taller gratuito en una colonia.',
    incluye: ['Aportación directa a talleres comunitarios'],
    precio: null, precio_minimo: 100, duracion_min: null, cupo_maximo: null, porcentaje_aportacion: 100, variantes: [], horarios: [],
  },
];
