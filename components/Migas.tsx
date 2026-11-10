import Link from 'next/link';
import { SITIO } from '@/lib/sitio';
import { JsonLd } from './JsonLd';

export interface Miga { nombre: string; ruta: string }

// Ruta de navegación visible + BreadcrumbList con los mismos datos.
export function Migas({ migas }: { migas: Miga[] }) {
  return (
    <>
      <nav aria-label="Ruta de navegación" className="migas">
        <ol>
          {migas.map((m, i) => (
            <li key={m.ruta}>
              {i < migas.length - 1 ? <Link href={m.ruta}>{m.nombre}</Link> : <span aria-current="page">{m.nombre}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        datos={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: migas.map((m, i) => ({ '@type': 'ListItem', position: i + 1, name: m.nombre, item: `${SITIO.url}${m.ruta}` })),
        }}
      />
    </>
  );
}
