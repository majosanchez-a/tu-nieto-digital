import Image from 'next/image';
import Link from 'next/link';
import type { Articulo } from '@/lib/tipos';
import { aportacionDe, dinero, imagenDe } from '@/lib/formato';

// Etiqueta corta y botón según el tipo de artículo (todos llevan al detalle, donde se elige versión, horario o monto).
function etiquetaDe(a: Articulo) {
  if (a.tipo === 'producto') return 'Producto físico';
  if (a.tipo === 'aportacion') return 'Aportación';
  if (a.cupo_maximo && a.cupo_maximo > 1) return `Empresas · hasta ${a.cupo_maximo}`;
  return a.duracion_min ? `Servicio · ${a.duracion_min} min` : 'Servicio';
}
function accionDe(a: Articulo) {
  if (a.tipo === 'producto') return 'Elegir versión';
  if (a.tipo === 'aportacion') return 'Aportar';
  if (a.horarios.length > 0) return 'Elegir horario';
  return 'Ver detalle';
}

export function TarjetaArticulo({ articulo, prioridad = false }: { articulo: Articulo; prioridad?: boolean }) {
  const img = imagenDe(articulo.slug);
  const aporte = articulo.precio != null ? aportacionDe(articulo.precio, articulo.porcentaje_aportacion) : null;
  const existencias = articulo.variantes.reduce((s, v) => s + v.existencias, 0);
  return (
    <article className="tarjeta">
      <Link href={`/tienda/${articulo.slug}`} className="tarjeta-imagen" tabIndex={-1} aria-hidden="true">
        <Image src={img.src} alt="" width={600} height={450} priority={prioridad} sizes="(max-width: 700px) 100vw, 300px" />
      </Link>
      <div className="tarjeta-cuerpo">
        <span className={`etiqueta ${articulo.tipo === 'aportacion' ? 'etiqueta-aporte' : ''}`}>{etiquetaDe(articulo)}</span>
        <h3><Link href={`/tienda/${articulo.slug}`}>{articulo.nombre}</Link></h3>
        <p>{articulo.descripcion}</p>
        {articulo.tipo === 'producto' && (
          <p className="tarjeta-disponible">{existencias > 0 ? `Disponible · ${existencias} piezas` : 'Agotado'}</p>
        )}
        <div className="tarjeta-pie">
          <p className="precio">{articulo.precio != null ? dinero(articulo.precio) : <><small>desde </small>{dinero(articulo.precio_minimo ?? 0)}</>}</p>
          <p className="aporte">{aporte != null ? `${dinero(aporte)} a talleres` : '100% a talleres'}</p>
        </div>
        <Link href={`/tienda/${articulo.slug}`} className="tarjeta-cta" aria-label={`${accionDe(articulo)}: ${articulo.nombre}`}>{accionDe(articulo)}</Link>
      </div>
    </article>
  );
}
