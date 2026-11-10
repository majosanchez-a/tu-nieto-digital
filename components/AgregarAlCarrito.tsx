'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCarrito } from '@/lib/carrito';
import { dinero, textoHorario } from '@/lib/formato';
import type { Articulo } from '@/lib/tipos';
import { IconoAlerta, IconoCarrito, IconoCheck } from './Iconos';

const MONTOS = [100, 250, 500];

export function AgregarAlCarrito({ articulo }: { articulo: Articulo }) {
  const { agregar } = useCarrito();
  const conStock = articulo.variantes.filter((v) => v.existencias > 0);
  const [varianteId, setVarianteId] = useState(conStock[0]?.id ?? '');
  const [horarioId, setHorarioId] = useState(articulo.horarios[0]?.id ?? '');
  const [cantidad, setCantidad] = useState(1);
  const [monto, setMonto] = useState(String(articulo.precio_minimo ?? 100));
  const [error, setError] = useState('');
  const [agregado, setAgregado] = useState('');

  const variante = articulo.variantes.find((v) => v.id === varianteId);
  const maximo = articulo.tipo === 'producto' ? Math.min(10, variante?.existencias ?? 0) : articulo.horarios.length > 0 ? 1 : 3;
  const agotado = articulo.tipo === 'producto' && conStock.length === 0;

  function alAgregar() {
    setError('');
    let precioUnitario = articulo.precio ?? 0;
    if (articulo.tipo === 'aportacion') {
      precioUnitario = Math.round(Number(monto));
      const minimo = articulo.precio_minimo ?? 0;
      if (!Number.isFinite(precioUnitario) || precioUnitario < minimo) {
        setError(`La aportación mínima es de ${dinero(minimo)}.`);
        return;
      }
    }
    if (articulo.tipo === 'producto' && !variante) { setError('Elige una versión disponible.'); return; }
    const horario = articulo.horarios.find((h) => h.id === horarioId);
    if (articulo.tipo === 'servicio' && articulo.horarios.length > 0 && !horario) { setError('Elige un horario.'); return; }

    agregar({
      slug: articulo.slug,
      nombre: articulo.nombre,
      tipo: articulo.tipo,
      precioUnitario,
      porcentajeAportacion: articulo.porcentaje_aportacion,
      cantidad: articulo.tipo === 'aportacion' ? 1 : cantidad,
      varianteId: variante?.id,
      varianteNombre: variante?.nombre,
      horarioId: horario?.id,
      horarioTexto: horario ? textoHorario(horario) : undefined,
    });
    setAgregado(`${articulo.nombre}${variante ? ` (${variante.nombre})` : ''}`);
  }

  return (
    <div className="compra">
      {articulo.tipo === 'producto' && (
        <fieldset className="grupo-opciones">
          <legend>Versión de las guías</legend>
          <div className="opciones">
            {articulo.variantes.map((v) => (
              <label key={v.id} className={`opcion ${v.id === varianteId ? 'activa' : ''} ${v.existencias === 0 ? 'deshabilitada' : ''}`}>
                <input type="radio" name="variante" value={v.id} checked={v.id === varianteId} disabled={v.existencias === 0}
                  onChange={() => { setVarianteId(v.id); setCantidad(1); }} />
                <span>{v.nombre}<small>{v.existencias > 0 ? `${v.existencias} disponibles` : 'Agotado'}</small></span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {articulo.tipo === 'servicio' && articulo.horarios.length > 0 && (
        <fieldset className="grupo-opciones">
          <legend>Elige fecha y horario</legend>
          <div className="opciones opciones-columna">
            {articulo.horarios.map((h) => (
              <label key={h.id} className={`opcion ${h.id === horarioId ? 'activa' : ''}`}>
                <input type="radio" name="horario" value={h.id} checked={h.id === horarioId} onChange={() => setHorarioId(h.id)} />
                <span>{textoHorario(h)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {articulo.tipo === 'servicio' && articulo.horarios.length === 0 && (
        <p className="nota">La fecha se acuerda contigo por WhatsApp después de confirmar el pedido.</p>
      )}

      {articulo.tipo === 'aportacion' && (
        <fieldset className="grupo-opciones">
          <legend>Monto de tu aportación</legend>
          <div className="opciones">
            {MONTOS.map((m) => (
              <button key={m} type="button" className={`opcion ${monto === String(m) ? 'activa' : ''}`} aria-pressed={monto === String(m)} onClick={() => setMonto(String(m))}>
                {dinero(m)}
              </button>
            ))}
          </div>
          <label htmlFor="monto" className="etiqueta-campo">Otro monto (mínimo {dinero(articulo.precio_minimo ?? 0)})</label>
          <input id="monto" type="number" inputMode="numeric" min={articulo.precio_minimo ?? 0} step={1} value={monto}
            onChange={(e) => setMonto(e.target.value)} className="campo campo-corto" aria-describedby={error ? 'error-compra' : undefined} />
        </fieldset>
      )}

      {error && <p className="error-campo" id="error-compra" role="alert"><IconoAlerta size={18} /> {error}</p>}

      <div className="fila-compra">
        {articulo.tipo !== 'aportacion' && maximo > 1 && (
          <div className="selector-cantidad" role="group" aria-label="Cantidad">
            <button type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))} disabled={cantidad <= 1} aria-label="Quitar una pieza">−</button>
            <output aria-live="polite">{cantidad}</output>
            <button type="button" onClick={() => setCantidad((c) => Math.min(maximo, c + 1))} disabled={cantidad >= maximo} aria-label="Agregar una pieza">+</button>
          </div>
        )}
        <button type="button" className="boton boton-principal" onClick={alAgregar} disabled={agotado}>
          <IconoCarrito /> {agotado ? 'Agotado' : articulo.tipo === 'aportacion' ? 'Agregar aportación' : 'Añadir al carrito'}
        </button>
      </div>

      <div aria-live="polite">
        {agregado && (
          <div className="aviso-exito">
            <IconoCheck /> <span><strong>Agregado al carrito:</strong> {agregado}</span>
            <Link href="/carrito" className="boton boton-principal boton-chico">Ver carrito</Link>
          </div>
        )}
      </div>
    </div>
  );
}
