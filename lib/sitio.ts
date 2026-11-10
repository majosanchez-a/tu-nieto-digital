// Datos generales del sitio usados en metadatos, sitemap y datos estructurados.
export const SITIO = {
  nombre: 'Tu Nieto Digital',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://tu-nieto-digital.vercel.app').replace(/\/$/, ''),
  descripcion:
    'Tienda solidaria de seguridad digital para adultos mayores: cada compra lleva un taller gratuito a una colonia de Aguascalientes.',
  costoEnvioLocal: 60,
};

// ¿Hay conexión configurada con Supabase? Si no, el sitio usa datos de demostración locales.
export const supabaseConfigurado = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
