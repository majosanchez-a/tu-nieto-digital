import type { MetadataRoute } from 'next';
import { obtenerArticulos } from '@/lib/datos';
import { SITIO } from '@/lib/sitio';

// Solo páginas públicas indexables: el carrito, el checkout y la confirmación quedan fuera.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let slugs: string[] = [];
  try {
    slugs = (await obtenerArticulos()).map((a) => a.slug);
  } catch {
    slugs = [];
  }
  return [
    { url: `${SITIO.url}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITIO.url}/tienda`, changeFrequency: 'weekly', priority: 0.9 },
    ...slugs.map((s) => ({ url: `${SITIO.url}/tienda/${s}`, changeFrequency: 'weekly' as const, priority: 0.8 })),
    { url: `${SITIO.url}/como-funciona`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITIO.url}/aviso-de-privacidad`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
