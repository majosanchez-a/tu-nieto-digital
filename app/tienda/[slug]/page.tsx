import Image from 'next/image';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { og } from '@/lib/seo';
import { obtenerArticulo, obtenerArticulos } from '@/lib/datos';
import { aportacionDe, dinero, etiquetaTipo, imagenDe } from '@/lib/formato';
import { SITIO } from '@/lib/sitio';
import { Migas } from '@/components/Migas';
import { JsonLd } from '@/components/JsonLd';
import { TarjetaArticulo } from '@/components/TarjetaArticulo';
import { AgregarAlCarrito } from '@/components/AgregarAlCarrito';
import { IconoCamion, IconoLibro, IconoQR, IconoTarjetas, IconoUbicacion, IconoVideo } from '@/components/Iconos';
import { BarraAportacion } from '@/components/BarraAportacion';

const DESCRIPCIONES_SEO: Record<string, string> = {
  'kit-tu-nieto-digital': 'Kit con guía impresa, tarjetas de práctica y acceso al curso para que tus papás y abuelos reconozcan estafas por WhatsApp y llamadas.',
  'sesion-personalizada': 'Sesión de una hora a domicilio o por videollamada: configuramos la seguridad del celular de tu familiar y practicamos con el simulador.',
  'taller-para-empresas': 'Taller de seguridad digital de dos horas en tu empresa, para tu equipo o tus clientes adultos mayores, con material para cada participante.',
  'regala-un-taller': 'Patrocina total o parcialmente un taller gratuito de seguridad digital para adultos mayores en una colonia de Aguascalientes.',
};

export async function generateStaticParams() {
  return (await obtenerArticulos()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(props: PageProps<'/tienda/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const a = await obtenerArticulo(slug);
  if (!a) return { title: 'Artículo no encontrado', robots: { index: false } };
  const descripcion = DESCRIPCIONES_SEO[a.slug] ?? a.descripcion;
  const img = imagenDe(a.slug);
  return {
    title: a.nombre,
    description: descripcion,
    alternates: { canonical: `/tienda/${a.slug}` },
    openGraph: og({ title: `${a.nombre} | ${SITIO.nombre}`, description: descripcion, url: `/tienda/${a.slug}`, images: [{ url: img.src, width: 1200, height: 900, alt: img.alt }] }),
  };
}

const ICONOS = [IconoLibro, IconoTarjetas, IconoQR, IconoVideo];

async function ContenidoDetalle({ params }: Pick<PageProps<'/tienda/[slug]'>, 'params'>) {
  const { slug } = await params;
  const articulo = await obtenerArticulo(slug);
  if (!articulo) notFound();

  const img = imagenDe(articulo.slug);
  const otros = (await obtenerArticulos()).filter((a) => a.slug !== articulo.slug).slice(0, 3);
  const existencias = articulo.variantes.reduce((s, v) => s + v.existencias, 0);
  const aporte = articulo.precio != null ? aportacionDe(articulo.precio, articulo.porcentaje_aportacion) : null;

  // Datos estructurados solo con información visible y real de la base (sin reseñas ni valoraciones).
  const disponible = articulo.tipo === 'producto' ? existencias > 0 : true;
  const producto = articulo.tipo !== 'aportacion' && articulo.precio != null && {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: articulo.nombre,
    description: articulo.descripcion,
    sku: articulo.slug,
    image: `${SITIO.url}${img.src}`,
    brand: { '@type': 'Brand', name: SITIO.nombre },
    offers: {
      '@type': 'Offer',
      price: articulo.precio.toFixed(2),
      priceCurrency: 'MXN',
      availability: disponible ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITIO.url}/tienda/${articulo.slug}`,
    },
  };

  return (
    <>
      {producto && <JsonLd datos={producto} />}
      <Migas migas={[{ nombre: 'Inicio', ruta: '/' }, { nombre: 'Tienda', ruta: '/tienda' }, { nombre: articulo.nombre, ruta: `/tienda/${articulo.slug}` }]} />

      <div className="detalle">
        <div className="detalle-galeria">
          <div className="detalle-imagen">
            <Image src={img.src} alt={img.alt} width={1200} height={900} priority sizes="(max-width: 900px) 100vw, 600px" />
          </div>
          {articulo.incluye.length > 1 && (
            <ul className="mosaico-incluye" aria-label="Lo principal que incluye">
              {articulo.incluye.slice(0, 3).map((texto, i) => {
                const Icono = ICONOS[i % ICONOS.length];
                return <li key={texto}><Icono size={24} />{texto}</li>;
              })}
            </ul>
          )}
        </div>

        <div className="detalle-info">
          <span className={`etiqueta ${articulo.tipo === 'aportacion' ? 'etiqueta-aporte' : ''}`}>{etiquetaTipo[articulo.tipo]}</span>
          <h1>{articulo.nombre}</h1>
          <p className="detalle-descripcion">{articulo.descripcion}</p>
          <div className="detalle-precio">
            <p className="precio precio-grande">{articulo.precio != null ? dinero(articulo.precio) : <><small>desde </small>{dinero(articulo.precio_minimo ?? 0)}</>}</p>
            <span className="moneda">MXN</span>
            {articulo.tipo === 'producto' && (
              <p className={`disponibilidad ${existencias > 0 ? '' : 'agotado'}`}>{existencias > 0 ? `Disponible · ${existencias} piezas` : 'Agotado por ahora'}</p>
            )}
          </div>
          {articulo.precio != null && aporte != null
            ? <BarraAportacion titulo={articulo.nombre} precio={articulo.precio} aporte={aporte} variante="clara" />
            : <p className="aporte">El 100% de tu aportación va a talleres gratuitos.</p>}
          <AgregarAlCarrito articulo={articulo} />
          {articulo.tipo === 'producto' && (
            <ul className="info-entrega">
              <li><IconoCamion size={22} /> <span>Envío local en Aguascalientes · <strong className="cifra-mono">{dinero(SITIO.costoEnvioLocal)}</strong></span></li>
              <li><IconoUbicacion size={22} /> <span>Recolección en punto acordado · <strong>sin costo</strong></span></li>
            </ul>
          )}
        </div>
      </div>

      <section className="seccion" aria-labelledby="titulo-incluye">
        <h2 id="titulo-incluye">Qué incluye</h2>
        <ul className="detalle-secciones">
          {articulo.incluye.map((texto, i) => (
            <li key={texto} className="incluye-tarjeta"><span className="paso-num">{String(i + 1).padStart(2, '0')}</span><h3>{texto}</h3></li>
          ))}
          {articulo.duracion_min && <li className="incluye-tarjeta"><span className="paso-num">DURACIÓN</span><h3>{articulo.duracion_min} minutos</h3></li>}
          {articulo.cupo_maximo && articulo.cupo_maximo > 1 && <li className="incluye-tarjeta"><span className="paso-num">CUPO</span><h3>Hasta {articulo.cupo_maximo} participantes</h3></li>}
          <li className="incluye-tarjeta incluye-oscura">
            <span className="paso-num">TU APORTACIÓN</span>
            <h3>{articulo.tipo === 'aportacion' ? 'El 100% va a talleres' : `El ${articulo.porcentaje_aportacion}% va a talleres`}</h3>
            <p>Se destina a talleres gratuitos de seguridad digital en colonias de Aguascalientes.</p>
          </li>
        </ul>
      </section>

      <section className="seccion" aria-labelledby="titulo-relacionados">
        <h2 id="titulo-relacionados">También te puede interesar</h2>
        <div className="rejilla">
          {otros.map((a) => <TarjetaArticulo key={a.id} articulo={a} />)}
        </div>
      </section>
    </>
  );
}

function DetalleCargando() {
  return (
    <div className="detalle" role="status" aria-live="polite">
      <p className="solo-lectores">Cargando el artículo…</p>
      <div className="esqueleto" style={{ aspectRatio: '4 / 3' }} />
      <div className="esqueleto" style={{ height: 420 }} />
    </div>
  );
}

export default function DetalleArticulo(props: PageProps<'/tienda/[slug]'>) {
  return (
    <div className="contenedor pagina">
      <Suspense fallback={<DetalleCargando />}>
        <ContenidoDetalle params={props.params} />
      </Suspense>
    </div>
  );
}
