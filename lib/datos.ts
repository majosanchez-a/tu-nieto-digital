import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { cacheLife } from 'next/cache';
import { supabaseConfigurado } from './sitio';
import { ARTICULOS_DEMO } from './demo';
import type { Articulo } from './tipos';

const ORDEN = ['kit-tu-nieto-digital', 'sesion-personalizada', 'taller-para-empresas', 'regala-un-taller'];
const posicion = (slug: string) => (ORDEN.includes(slug) ? ORDEN.indexOf(slug) : 99);
const ordenar = (lista: Articulo[]) => [...lista].sort((a, b) => posicion(a.slug) - posicion(b.slug));

function clientePublico() {
  // Llave pública: lo que puede leer está limitado por las políticas RLS.
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
}

function normalizar(fila: Record<string, unknown>): Articulo {
  const a = fila as unknown as Articulo & { precio: string | number | null; precio_minimo: string | number | null; porcentaje_aportacion: string | number };
  return {
    ...a,
    precio: a.precio == null ? null : Number(a.precio),
    precio_minimo: a.precio_minimo == null ? null : Number(a.precio_minimo),
    porcentaje_aportacion: Number(a.porcentaje_aportacion),
    incluye: a.incluye ?? [],
    variantes: (a.variantes ?? []).sort((x, y) => x.nombre.localeCompare(y.nombre)),
    horarios: (a.horarios ?? []).sort((x, y) => x.inicio.localeCompare(y.inicio)),
  };
}

/** Catálogo completo de artículos activos (Supabase o datos de demostración). */
export async function obtenerArticulos(): Promise<Articulo[]> {
  'use cache';
  cacheLife('minutes'); // el catálogo se actualiza cada pocos minutos
  if (!supabaseConfigurado) return ordenar(ARTICULOS_DEMO);
  const { data, error } = await clientePublico()
    .from('articulos')
    .select('id, slug, nombre, tipo, descripcion, incluye, precio, precio_minimo, duracion_min, cupo_maximo, porcentaje_aportacion, variantes(id, nombre, existencias), horarios(id, inicio, fin, modalidad)')
    .eq('activo', true);
  if (error) throw new Error('No se pudo cargar el catálogo desde Supabase: ' + error.message);
  return ordenar((data ?? []).map(normalizar));
}

/** Un artículo por su slug, o null si no existe. */
export async function obtenerArticulo(slug: string): Promise<Articulo | null> {
  'use cache';
  cacheLife('minutes');
  const todos = await obtenerArticulos();
  return todos.find((a) => a.slug === slug) ?? null;
}
