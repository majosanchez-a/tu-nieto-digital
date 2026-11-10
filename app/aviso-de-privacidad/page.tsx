import type { Metadata } from 'next';
import { og } from '@/lib/seo';
import { Migas } from '@/components/Migas';

export const metadata: Metadata = {
  title: 'Aviso de privacidad',
  description: 'Qué datos pide Tu Nieto Digital al registrar un pedido, para qué se usan y cómo se protegen.',
  alternates: { canonical: '/aviso-de-privacidad' },
  openGraph: og({ title: 'Aviso de privacidad | Tu Nieto Digital', url: '/aviso-de-privacidad' }),
};

export default function Aviso() {
  return (
    <div className="contenedor pagina pagina-texto">
      <Migas migas={[{ nombre: 'Inicio', ruta: '/' }, { nombre: 'Aviso de privacidad', ruta: '/aviso-de-privacidad' }]} />
      <h1>Aviso de privacidad</h1>
      <p className="aviso-pruebas-texto">Este sitio es un proyecto escolar en modo de demostración. Usa datos de prueba: no escribas información personal real.</p>
      <h2>Qué datos pedimos</h2>
      <p>Al registrar un pedido pedimos tu nombre, tu correo y, de forma opcional, tu WhatsApp. Si eliges envío del kit, también la calle, la colonia y el código postal.</p>
      <h2>Para qué los usamos</h2>
      <p>Solo para registrar el pedido, coordinar la entrega o el horario de la sesión y avisarte del estado de tu compra.</p>
      <h2>Lo que no pedimos</h2>
      <p>Nunca pedimos contraseñas, códigos de verificación ni datos bancarios por mensaje. Los cuestionarios de los talleres son anónimos.</p>
      <h2>Cómo los protegemos</h2>
      <p>Los pedidos se guardan desde el servidor con reglas de seguridad que impiden que el público los consulte; el navegador solo puede leer el catálogo.</p>
    </div>
  );
}
