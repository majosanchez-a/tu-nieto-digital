'use client';
import Link from 'next/link';
import { useCarrito } from '@/lib/carrito';
import { IconoCarrito } from './Iconos';

export function BotonCarrito() {
  const { totalPiezas, listo } = useCarrito();
  const n = listo ? totalPiezas : 0;
  return (
    <Link href="/carrito" className="boton-icono boton-carrito" aria-label={n > 0 ? `Carrito, ${n} ${n === 1 ? 'artículo' : 'artículos'}` : 'Carrito vacío'}>
      <IconoCarrito size={22} />
      {n > 0 && <span className="insignia" aria-hidden="true">{n}</span>}
    </Link>
  );
}
