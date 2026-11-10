import type { Metadata } from 'next';
import { FormularioCheckout } from '@/components/FormularioCheckout';

export const metadata: Metadata = {
  title: 'Finalizar compra',
  description: 'Completa tus datos y la entrega para registrar tu pedido. El pago está en modo de demostración.',
  robots: { index: false, follow: false },
};

export default function Checkout() {
  return (
    <div className="contenedor pagina">
      <h1>Finalizar compra</h1>
      <FormularioCheckout />
    </div>
  );
}
