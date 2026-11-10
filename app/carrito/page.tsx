import type { Metadata } from 'next';
import { VistaCarrito } from '@/components/VistaCarrito';

export const metadata: Metadata = {
  title: 'Tu carrito',
  description: 'Revisa los artículos de tu carrito, cambia cantidades y ve cuánto de tu compra va a talleres gratuitos.',
  robots: { index: false, follow: true },
};

export default function Carrito() {
  return (
    <div className="contenedor pagina">
      <h1>Tu carrito</h1>
      <VistaCarrito />
    </div>
  );
}
