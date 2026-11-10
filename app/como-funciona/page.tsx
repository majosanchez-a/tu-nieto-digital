import Link from 'next/link';
import type { Metadata } from 'next';
import { og } from '@/lib/seo';
import { Migas } from '@/components/Migas';

export const metadata: Metadata = {
  title: 'Cómo funciona: talleres gratuitos de seguridad digital',
  description: 'Así funciona la tienda solidaria: una parte de cada compra financia talleres gratuitos de seguridad digital para adultos mayores en colonias de Aguascalientes.',
  alternates: { canonical: '/como-funciona' },
  openGraph: og({ title: 'Cómo funciona | Tu Nieto Digital', description: 'Cada compra financia talleres gratuitos de seguridad digital en Aguascalientes.', url: '/como-funciona' }),
};

export default function ComoFunciona() {
  return (
    <div className="contenedor pagina pagina-texto">
      <Migas migas={[{ nombre: 'Inicio', ruta: '/' }, { nombre: 'Cómo funciona', ruta: '/como-funciona' }]} />
      <h1>Cómo funciona Tu Nieto Digital</h1>
      <p className="subtitulo">Una tienda en línea que vende herramientas de seguridad digital para familias y empresas, y usa una parte de cada venta para dar talleres gratuitos a adultos mayores.</p>

      <h2>Una tienda que financia talleres gratuitos</h2>
      <p>Los adultos mayores son blanco frecuente de fraudes por WhatsApp, llamadas y redes sociales. Sus hijos y nietos quieren protegerlos, pero no siempre saben cómo enseñarles. En la tienda encuentras el Kit Tu Nieto Digital, sesiones personalizadas y talleres para empresas; antes de pagar ves cuánto de tu compra se destina a la comunidad.</p>

      <h2>Así se usa tu compra</h2>
      <ol className="pasos-lista">
        <li><strong>Compras como invitado.</strong> Eliges un artículo, lo agregas al carrito y confirmas tus datos de entrega.</li>
        <li><strong>Tu familiar aprende en casa.</strong> El kit trae una guía impresa, tarjetas para practicar «¿Es estafa o no?» y acceso al curso en línea.</li>
        <li><strong>Se acumula la aportación.</strong> Una parte de cada venta se registra para el siguiente taller gratuito.</li>
        <li><strong>Llevamos el taller a una colonia.</strong> Con un aliado local explicamos los fraudes más comunes y configuramos la seguridad de cada celular.</li>
      </ol>

      <h2 id="talleres">Los talleres gratuitos</h2>
      <h3>¿Dónde se imparten?</h3>
      <p>En centros comunitarios, parroquias, grupos del DIF y comités vecinales de Aguascalientes que prestan el espacio y convocan a los asistentes.</p>
      <h3>¿Cómo medimos lo aprendido?</h3>
      <p>Cada asistente contesta un cuestionario anónimo antes y después del taller. Los resultados por zona se publicarán en el mapa de impacto.</p>

      <h2>Preguntas frecuentes</h2>
      <h3>¿Tengo que crear una cuenta para comprar?</h3>
      <p>No. Puedes comprar como invitado con tu nombre y correo.</p>
      <h3>¿Se cobra dinero real?</h3>
      <p>Todavía no. El sitio es un proyecto escolar y el pago está en modo de demostración; ningún pedido genera cobros.</p>
      <h3>¿Puedo apoyar sin comprar el kit?</h3>
      <p>Sí. Con «Regala un taller» patrocinas parte o la totalidad de un taller gratuito.</p>

      <div className="acciones">
        <Link href="/tienda" className="boton boton-principal">Ver la tienda</Link>
        <Link href="/tienda/regala-un-taller" className="boton boton-secundario">Regalar un taller</Link>
      </div>
    </div>
  );
}
