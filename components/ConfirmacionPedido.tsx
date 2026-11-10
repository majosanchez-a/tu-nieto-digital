'use client';

import Link from 'next/link';
import { useMemo, useSyncExternalStore } from 'react';
import type { ResumenPedido } from '@/app/checkout/acciones';
import { dinero } from '@/lib/formato';
import { IconoCheck, IconoCorazon } from './Iconos';

const sinSuscripcion = () => () => {};

interface Guardado { folio: string; simulado?: boolean; resumen?: ResumenPedido }

export function ConfirmacionPedido({ folio }: { folio: string }) {
  // Resumen guardado por el formulario de pago en esta pestaña (no se consulta la base de datos).
  const guardado = useSyncExternalStore(sinSuscripcion, () => sessionStorage.getItem('tnd-ultimo-pedido'), () => null);
  const listo = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  const datos = useMemo(() => {
    try {
      const g = JSON.parse(guardado || 'null') as Guardado | null;
      return g && g.folio === folio ? g : null;
    } catch {
      return null;
    }
  }, [guardado, folio]);

  const r = datos?.resumen;
  return (
    <div className="confirmacion">
      <span className="confirmacion-icono" aria-hidden="true"><IconoCheck size={40} /></span>
      <h1>¡Pedido registrado!</h1>
      <p className="confirmacion-folio">Tu número de pedido es <strong>{folio}</strong>.</p>
      <p className="aviso-pruebas-texto">
        {datos?.simulado
          ? 'Demostración: este pedido no se guardó en la base de datos y no se realizó ningún cobro.'
          : 'El pedido quedó guardado como pendiente. El pago es una demostración: no se realizó ningún cobro.'}
      </p>

      {listo && r && (
        <section className="resumen confirmacion-resumen" aria-labelledby="titulo-confirmacion">
          <h2 id="titulo-confirmacion">Resumen</h2>
          <ul className="resumen-lineas">
            {r.lineas.map((l, i) => (
              <li key={i}><span>{l.nombre}{l.detalle ? ` · ${l.detalle}` : ''} × {l.cantidad}</span><span>{dinero(l.importe)}</span></li>
            ))}
          </ul>
          <dl>
            {r.entrega && <div><dt>Entrega</dt><dd>{r.entrega}{r.envio ? ` · ${dinero(r.envio)}` : ''}</dd></div>}
            <div className="total"><dt>Total</dt><dd>{dinero(r.total)}</dd></div>
          </dl>
          <p className="resumen-aporte"><IconoCorazon /> <span>Aportaste <strong>{dinero(r.aportacion)}</strong> para talleres gratuitos.</span></p>
        </section>
      )}

      <h2 className="confirmacion-sigue">¿Qué sigue?</h2>
      <ol className="pasos-lista">
        <li>Te escribimos por correo o WhatsApp para confirmar la entrega o el horario.</li>
        <li>Preparamos tu kit o agendamos tu sesión.</li>
        <li>Tu familiar entra al curso con el QR de la guía.</li>
      </ol>
      <div className="acciones">
        <Link href="/tienda" className="boton boton-principal">Seguir comprando</Link>
        <Link href="/" className="boton boton-secundario">Volver al inicio</Link>
      </div>
    </div>
  );
}
