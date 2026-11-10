import type { Metadata } from 'next';
import { SITIO } from './sitio';

// Open Graph común: Next.js reemplaza (no combina) el objeto openGraph de cada página,
// así que cada página parte de esta base para no perder la imagen ni el nombre del sitio.
export const IMAGEN_OG = { url: '/og-tu-nieto-digital.png', width: 1200, height: 630, alt: 'Tu Nieto Digital: tienda solidaria de seguridad digital' };

export function og(datos: NonNullable<Metadata['openGraph']>): Metadata['openGraph'] {
  return { siteName: SITIO.nombre, locale: 'es_MX', type: 'website', images: [IMAGEN_OG], ...datos };
}
