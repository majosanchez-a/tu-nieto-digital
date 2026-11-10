import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { CarritoProvider } from '@/lib/carrito';
import { SITIO } from '@/lib/sitio';
import { og } from '@/lib/seo';
import { Encabezado } from '@/components/Encabezado';
import { PieDePagina } from '@/components/PieDePagina';
import { AvisoDemo } from '@/components/AvisoDemo';

// Tipografías locales (licencia SIL OFL): no dependen de servicios externos al compilar.
const titulos = localFont({
  src: [
    { path: './fonts/sora-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/sora-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--fuente-titulos',
  display: 'swap',
});
const texto = localFont({
  src: [
    { path: './fonts/dm-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/dm-sans-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/dm-sans-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--fuente',
  display: 'swap',
});
const mono = localFont({
  src: [
    { path: './fonts/jetbrains-mono-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/jetbrains-mono-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--fuente-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITIO.url),
  title: { default: 'Tu Nieto Digital · Seguridad digital para adultos mayores', template: '%s | Tu Nieto Digital' },
  description: SITIO.descripcion,
  applicationName: SITIO.nombre,
  openGraph: og({ title: 'Tu Nieto Digital · Seguridad digital para adultos mayores', description: SITIO.descripcion, url: '/' }),
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = { themeColor: '#061F23' };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es-MX" className={`${titulos.variable} ${texto.variable} ${mono.variable}`}>
      <body>
        <a href="#contenido" className="saltar">Saltar al contenido</a>
        <CarritoProvider>
          <AvisoDemo />
          <Encabezado />
          <main id="contenido" tabIndex={-1}>{children}</main>
          <PieDePagina />
        </CarritoProvider>
      </body>
    </html>
  );
}
