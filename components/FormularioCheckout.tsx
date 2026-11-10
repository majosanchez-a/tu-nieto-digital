'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef, useState } from 'react';
import { crearPedido, type EstadoPedido } from '@/app/checkout/acciones';
import { useCarrito } from '@/lib/carrito';
import { dinero } from '@/lib/formato';
import { SITIO } from '@/lib/sitio';
import { IconoAlerta, IconoEscudo } from './Iconos';

const inicial: EstadoPedido = { ok: false };

function Campo({ id, etiqueta, error, opcional, ...props }: { id: string; etiqueta: string; error?: string; opcional?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="campo-grupo">
      <label htmlFor={id} className="etiqueta-campo">{etiqueta}{opcional && <span className="opcional"> (opcional)</span>}</label>
      <input id={id} name={id} className={`campo ${error ? 'campo-error' : ''}`} aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {error && <p className="error-campo" id={`${id}-error`}><IconoAlerta size={17} /> {error}</p>}
    </div>
  );
}

export function FormularioCheckout() {
  const { items, listo, subtotal, aportacion, vaciar } = useCarrito();
  const [estado, accion, enviando] = useActionState(crearPedido, inicial);
  const [entrega, setEntrega] = useState('envio_local');
  const router = useRouter();
  const resumenErrores = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (estado.ok && estado.folio) {
      sessionStorage.setItem('tnd-ultimo-pedido', JSON.stringify({ folio: estado.folio, simulado: estado.simulado, resumen: estado.resumen }));
      vaciar();
      router.push(`/pedido/${estado.folio}`);
    } else if (estado.mensaje) {
      resumenErrores.current?.focus();
    }
  }, [estado, vaciar, router]);

  if (!listo) return <p className="estado-carga" role="status">Cargando tu pedido…</p>;
  if (items.length === 0 && !estado.ok) {
    return (
      <div className="estado-vacio">
        <h2>No hay artículos para pagar</h2>
        <p>Tu carrito está vacío. Agrega un artículo para continuar.</p>
        <Link href="/tienda" className="boton boton-principal">Ir a la tienda</Link>
      </div>
    );
  }

  const hayProducto = items.some((i) => i.tipo === 'producto');
  const envio = hayProducto && entrega === 'envio_local' ? SITIO.costoEnvioLocal : 0;
  const e = estado.errores ?? {};
  const v = estado.valores ?? {};
  const carrito = JSON.stringify(items.map((i) => ({ slug: i.slug, varianteId: i.varianteId, horarioId: i.horarioId, cantidad: i.cantidad, precioUnitario: i.precioUnitario })));

  return (
    <div className="checkout">
      <form action={accion} className="checkout-form" noValidate>
        <input type="hidden" name="carrito" value={carrito} />
        <div className="aviso-pruebas" role="note">
          <IconoEscudo size={22} />
          <p><strong>Pago de demostración.</strong> No se cobra dinero. El pago con Mercado Pago (Checkout Pro, modo de pruebas) se conecta en la siguiente etapa.</p>
        </div>

        {estado.mensaje && !estado.ok && (
          <div className="resumen-errores" role="alert" tabIndex={-1} ref={resumenErrores}>
            <IconoAlerta /> <p>{estado.mensaje}</p>
          </div>
        )}

        <fieldset>
          <legend>1. Tus datos</legend>
          <p className="nota">Compras como invitado: no necesitas crear una cuenta.</p>
          <Campo id="nombre" etiqueta="Nombre completo" autoComplete="name" defaultValue={v.nombre} error={e.nombre} required />
          <Campo id="correo" etiqueta="Correo electrónico" type="email" autoComplete="email" defaultValue={v.correo} error={e.correo} required />
          <Campo id="telefono" etiqueta="WhatsApp" type="tel" autoComplete="tel" inputMode="numeric" defaultValue={v.telefono} error={e.telefono} opcional />
        </fieldset>

        {hayProducto && (
          <fieldset>
            <legend>2. Entrega del kit</legend>
            <div className="opciones opciones-columna" role="radiogroup" aria-describedby={e.entrega ? 'entrega-error' : undefined}>
              <label className={`opcion ${entrega === 'envio_local' ? 'activa' : ''}`}>
                <input type="radio" name="entrega" value="envio_local" checked={entrega === 'envio_local'} onChange={() => setEntrega('envio_local')} />
                <span>Envío local en Aguascalientes · {dinero(SITIO.costoEnvioLocal)}</span>
              </label>
              <label className={`opcion ${entrega === 'recoleccion' ? 'activa' : ''}`}>
                <input type="radio" name="entrega" value="recoleccion" checked={entrega === 'recoleccion'} onChange={() => setEntrega('recoleccion')} />
                <span>Recolección en punto acordado · sin costo</span>
              </label>
            </div>
            {e.entrega && <p className="error-campo" id="entrega-error"><IconoAlerta size={17} /> {e.entrega}</p>}
            {entrega === 'envio_local' && (
              <div className="campos-domicilio">
                <Campo id="calle" etiqueta="Calle y número" autoComplete="street-address" defaultValue={v.calle} error={e.calle} />
                <Campo id="colonia" etiqueta="Colonia" defaultValue={v.colonia} error={e.colonia} />
                <Campo id="cp" etiqueta="Código postal" inputMode="numeric" autoComplete="postal-code" maxLength={5} defaultValue={v.cp} error={e.cp} />
                <Campo id="referencias" etiqueta="Referencias" defaultValue={v.referencias} opcional />
              </div>
            )}
          </fieldset>
        )}

        <fieldset>
          <legend>{hayProducto ? '3.' : '2.'} Confirmación</legend>
          <label className="casilla">
            <input type="checkbox" name="privacidad" aria-invalid={e.privacidad ? true : undefined} aria-describedby={e.privacidad ? 'privacidad-error' : undefined} />
            <span>Acepto el <Link href="/aviso-de-privacidad" target="_blank">aviso de privacidad</Link></span>
          </label>
          {e.privacidad && <p className="error-campo" id="privacidad-error"><IconoAlerta size={17} /> {e.privacidad}</p>}
        </fieldset>

        <button type="submit" className="boton boton-principal boton-ancho" disabled={enviando}>
          {enviando ? 'Registrando tu pedido…' : 'Confirmar pedido (pago de demostración)'}
        </button>
      </form>

      <aside className="resumen" aria-labelledby="titulo-resumen-pago">
        <h2 id="titulo-resumen-pago">Tu pedido</h2>
        <ul className="resumen-lineas">
          {items.map((i) => (
            <li key={i.clave}><span>{i.nombre}{i.varianteNombre ? ` · ${i.varianteNombre}` : ''} × {i.cantidad}</span><span>{dinero(i.precioUnitario * i.cantidad)}</span></li>
          ))}
        </ul>
        <dl>
          <div><dt>Subtotal</dt><dd>{dinero(subtotal)}</dd></div>
          {hayProducto && <div><dt>Envío</dt><dd>{envio ? dinero(envio) : 'Gratis'}</dd></div>}
          <div className="total"><dt>Total</dt><dd>{dinero(subtotal + envio)}</dd></div>
        </dl>
        <p className="resumen-aporte"><span>Incluye <strong>{dinero(aportacion)}</strong> para talleres gratuitos.</span></p>
        <Link href="/carrito" className="enlace-volver">← Volver al carrito</Link>
      </aside>
    </div>
  );
}
