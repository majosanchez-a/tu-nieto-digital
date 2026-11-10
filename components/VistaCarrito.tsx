'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCarrito } from '@/lib/carrito';
import { dinero, imagenDe } from '@/lib/formato';
import { SITIO } from '@/lib/sitio';
import { IconoBasura, IconoCorazon } from './Iconos';

export function VistaCarrito() {
  const { items, listo, subtotal, aportacion, cambiarCantidad, quitar } = useCarrito();
  const [aviso, setAviso] = useState('');

  if (!listo) return <p className="estado-carga" role="status">Cargando tu carrito…</p>;

  if (items.length === 0) {
    return (
      <div className="estado-vacio">
        <h2>Tu carrito está vacío</h2>
        <p>{aviso ? `${aviso} ` : ''}Agrega el kit, una sesión o un taller para proteger a tu familia.</p>
        <Link href="/tienda" className="boton boton-principal">Ir a la tienda</Link>
      </div>
    );
  }

  const hayProducto = items.some((i) => i.tipo === 'producto');
  return (
    <div className="carrito">
      <section aria-labelledby="titulo-articulos" className="carrito-lista">
        <h2 id="titulo-articulos" className="solo-lectores">Artículos en tu carrito</h2>
        <ul>
          {items.map((i) => (
            <li key={i.clave} className="linea-carrito">
              <Image src={imagenDe(i.slug).src} alt="" width={96} height={72} className="linea-imagen" />
              <div className="linea-info">
                <p className="linea-nombre"><Link href={`/tienda/${i.slug}`}>{i.nombre}</Link></p>
                {i.varianteNombre && <p className="linea-detalle">Versión: {i.varianteNombre}</p>}
                {i.horarioTexto && <p className="linea-detalle">{i.horarioTexto}</p>}
                <p className="linea-detalle">{dinero(i.precioUnitario)} c/u</p>
              </div>
              <div className="selector-cantidad" role="group" aria-label={`Cantidad de ${i.nombre}`}>
                <button type="button" onClick={() => cambiarCantidad(i.clave, i.cantidad - 1)} disabled={i.cantidad <= 1} aria-label={`Quitar uno de ${i.nombre}`}>−</button>
                <output aria-live="polite">{i.cantidad}</output>
                <button type="button" onClick={() => cambiarCantidad(i.clave, i.cantidad + 1)} disabled={i.cantidad >= (i.horarioId ? 1 : 10) || i.tipo === 'aportacion'} aria-label={`Agregar uno de ${i.nombre}`}>+</button>
              </div>
              <p className="linea-total">{dinero(i.precioUnitario * i.cantidad)}</p>
              <button type="button" className="boton-icono" onClick={() => { quitar(i.clave); setAviso(`Eliminaste ${i.nombre} del carrito.`); }} aria-label={`Eliminar ${i.nombre}`}>
                <IconoBasura />
              </button>
            </li>
          ))}
        </ul>
        <p className="solo-lectores" aria-live="polite">{aviso}</p>
        <Link href="/tienda" className="enlace-volver">← Seguir comprando</Link>
      </section>

      <aside className="resumen" aria-labelledby="titulo-resumen">
        <h2 id="titulo-resumen">Resumen del pedido</h2>
        <dl>
          <div><dt>Subtotal</dt><dd>{dinero(subtotal)}</dd></div>
          <div><dt>Envío</dt><dd>{hayProducto ? `Se elige al pagar (${dinero(SITIO.costoEnvioLocal)} o gratis)` : 'No aplica'}</dd></div>
        </dl>
        <p className="resumen-aporte"><IconoCorazon /> <span><strong>{dinero(aportacion)}</strong> de tu compra van a talleres gratuitos.</span></p>
        <Link href="/checkout" className="boton boton-principal boton-ancho">Continuar al pago</Link>
        <p className="nota">Compra como invitado, sin crear cuenta. Pago en modo de demostración.</p>
      </aside>
    </div>
  );
}
