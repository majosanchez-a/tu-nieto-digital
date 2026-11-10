import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { og } from '@/lib/seo';
import { obtenerArticulos } from '@/lib/datos';
import { CATEGORIAS, categoriaDe } from '@/lib/formato';
import type { Categoria } from '@/lib/tipos';
import { TarjetaArticulo } from '@/components/TarjetaArticulo';
import { Migas } from '@/components/Migas';
import { IconoBuscar } from '@/components/Iconos';

export const metadata: Metadata = {
  title: 'Tienda de seguridad digital para adultos mayores',
  description: 'Kit con guía y tarjetas de práctica, sesiones personalizadas a domicilio y talleres para empresas. Precios en pesos y aportación social visible en cada artículo.',
  // Los filtros y búsquedas apuntan a la versión preferida del catálogo
  alternates: { canonical: '/tienda' },
  openGraph: og({ title: 'Tienda de seguridad digital para adultos mayores | Tu Nieto Digital', description: 'Kits, sesiones y talleres contra fraudes digitales para adultos mayores.', url: '/tienda' }),
};

const sinAcentos = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

async function Catalogo({ searchParams }: Pick<PageProps<'/tienda'>, 'searchParams'>) {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q.trim().slice(0, 60) : '';
  const categoria = (typeof sp.categoria === 'string' && CATEGORIAS.some((c) => c.clave === sp.categoria) ? sp.categoria : '') as Categoria | '';

  const articulos = await obtenerArticulos();
  const filtrados = articulos.filter((a) => {
    const coincideCategoria = !categoria || categoriaDe(a) === categoria;
    const coincideBusqueda = !q || sinAcentos(`${a.nombre} ${a.descripcion} ${a.incluye.join(' ')}`).includes(sinAcentos(q));
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <>
      <div className="controles-catalogo">
        <nav aria-label="Filtrar por categoría" className="filtros">
          <Link href={q ? `/tienda?q=${encodeURIComponent(q)}` : '/tienda'} className={`filtro ${!categoria ? 'activo' : ''}`} aria-current={!categoria ? 'page' : undefined}>Todo</Link>
          {CATEGORIAS.map((c) => (
            <Link key={c.clave} href={`/tienda?categoria=${c.clave}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className={`filtro ${categoria === c.clave ? 'activo' : ''}`} aria-current={categoria === c.clave ? 'page' : undefined}>
              {c.nombre}
            </Link>
          ))}
        </nav>
        <form action="/tienda" method="get" role="search" className="buscador buscador-catalogo">
          {categoria && <input type="hidden" name="categoria" value={categoria} />}
          <label htmlFor="q-catalogo" className="solo-lectores">Buscar en el catálogo</label>
          <input id="q-catalogo" name="q" type="search" defaultValue={q} placeholder="Buscar en el catálogo" />
          <button type="submit" aria-label="Buscar"><IconoBuscar /></button>
        </form>
      </div>

      <p className="conteo" aria-live="polite">
        {filtrados.length} {filtrados.length === 1 ? 'artículo' : 'artículos'}{q ? ` para «${q}»` : ''}
      </p>

      {filtrados.length > 0 ? (
        <div className="rejilla">
          {filtrados.map((a, i) => <TarjetaArticulo key={a.id} articulo={a} prioridad={i === 0} />)}
        </div>
      ) : (
        <div className="estado-vacio">
          <h2>No encontramos resultados</h2>
          <p>Prueba con otra palabra, por ejemplo «kit», «sesión» o «taller».</p>
          <Link href="/tienda" className="boton boton-principal">Ver todo el catálogo</Link>
        </div>
      )}
    </>
  );
}

function CatalogoCargando() {
  return (
    <div role="status" aria-live="polite">
      <p className="solo-lectores">Cargando el catálogo…</p>
      <div className="rejilla">{[1, 2, 3].map((n) => <div key={n} className="esqueleto esqueleto-tarjeta" />)}</div>
    </div>
  );
}

export default function Tienda(props: PageProps<'/tienda'>) {
  return (
    <div className="contenedor pagina">
      <Migas migas={[{ nombre: 'Inicio', ruta: '/' }, { nombre: 'Tienda', ruta: '/tienda' }]} />
      <h1>Tienda solidaria</h1>
      <p className="subtitulo">Kits, sesiones y talleres para proteger a los adultos mayores de los fraudes digitales.</p>
      <Suspense fallback={<CatalogoCargando />}>
        <Catalogo searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
