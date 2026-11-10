'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import type { ItemCarrito } from './tipos';
import { aportacionDe } from './formato';

const CLAVE_ALMACEN = 'tnd-carrito';
const VACIO: ItemCarrito[] = [];

// --- Almacén externo: el carrito vive en localStorage y se comparte entre componentes y pestañas ---
const suscriptores = new Set<() => void>();
let enMemoria: ItemCarrito[] | null = null;

function leer(): ItemCarrito[] {
  if (enMemoria) return enMemoria;
  try {
    enMemoria = JSON.parse(localStorage.getItem(CLAVE_ALMACEN) || '[]') as ItemCarrito[];
  } catch {
    enMemoria = VACIO; // si el navegador no permite leerlo, se empieza vacío
  }
  return enMemoria;
}

function escribir(items: ItemCarrito[]) {
  enMemoria = items;
  try {
    localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(items));
  } catch {
    /* sin almacenamiento disponible: el carrito vive solo en memoria */
  }
  suscriptores.forEach((avisar) => avisar());
}

function suscribir(avisar: () => void) {
  suscriptores.add(avisar);
  const alCambiarEnOtraPestana = (e: StorageEvent) => {
    if (e.key === CLAVE_ALMACEN) { enMemoria = null; avisar(); }
  };
  window.addEventListener('storage', alCambiarEnOtraPestana);
  return () => { suscriptores.delete(avisar); window.removeEventListener('storage', alCambiarEnOtraPestana); };
}

const sinSuscripcion = () => () => {};

interface ContextoCarrito {
  items: ItemCarrito[];
  listo: boolean; // true cuando ya se leyó el carrito guardado en el navegador
  totalPiezas: number;
  subtotal: number;
  aportacion: number;
  agregar: (item: Omit<ItemCarrito, 'clave'>) => void;
  cambiarCantidad: (clave: string, cantidad: number) => void;
  quitar: (clave: string) => void;
  vaciar: () => void;
}

const Contexto = createContext<ContextoCarrito | null>(null);

export const claveDe = (i: Pick<ItemCarrito, 'slug' | 'varianteId' | 'horarioId' | 'precioUnitario' | 'tipo'>) =>
  [i.slug, i.varianteId ?? '', i.horarioId ?? '', i.tipo === 'aportacion' ? i.precioUnitario : ''].join('|');

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  // En el servidor el carrito está vacío; en el navegador se lee de localStorage.
  const items = useSyncExternalStore(suscribir, leer, () => VACIO);
  const listo = useSyncExternalStore(sinSuscripcion, () => true, () => false);

  const agregar = useCallback((nuevo: Omit<ItemCarrito, 'clave'>) => {
    const clave = claveDe(nuevo);
    const actual = leer();
    const existe = actual.find((i) => i.clave === clave);
    if (existe) {
      // Un horario de servicio solo se puede reservar una vez.
      const cantidad = nuevo.horarioId ? 1 : Math.min(existe.cantidad + nuevo.cantidad, 10);
      escribir(actual.map((i) => (i.clave === clave ? { ...i, cantidad } : i)));
    } else {
      escribir([...actual, { ...nuevo, clave }]);
    }
  }, []);

  const cambiarCantidad = useCallback((clave: string, cantidad: number) => {
    escribir(leer().map((i) => (i.clave === clave ? { ...i, cantidad: Math.max(1, Math.min(cantidad, i.horarioId ? 1 : 10)) } : i)));
  }, []);

  const quitar = useCallback((clave: string) => escribir(leer().filter((i) => i.clave !== clave)), []);
  const vaciar = useCallback(() => escribir(VACIO), []);

  const valor = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
    const aportacion = items.reduce((s, i) => s + aportacionDe(i.precioUnitario, i.porcentajeAportacion) * i.cantidad, 0);
    const totalPiezas = items.reduce((s, i) => s + i.cantidad, 0);
    return { items, listo, totalPiezas, subtotal, aportacion, agregar, cambiarCantidad, quitar, vaciar };
  }, [items, listo, agregar, cambiarCantidad, quitar, vaciar]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCarrito() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return ctx;
}
