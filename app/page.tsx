import Link from 'next/link';
import type { Metadata } from 'next';
import { obtenerArticulos } from '@/lib/datos';
import { aportacionDe } from '@/lib/formato';
import { SITIO } from '@/lib/sitio';
import { og } from '@/lib/seo';
import { TarjetaArticulo } from '@/components/TarjetaArticulo';
import { BarraAportacion } from '@/components/BarraAportacion';
import { JsonLd } from '@/components/JsonLd';
import { IconoCheck, IconoEscudo, IconoFlecha } from '@/components/Iconos';

export const metadata: Metadata = {
  title: { absolute: 'Seguridad digital para adultos mayores | Tu Nieto Digital' },
  description: 'Protege a tus papás y abuelos de fraudes por WhatsApp y llamadas con kits, sesiones y talleres. Cada compra financia talleres gratuitos en Aguascalientes.',
  alternates: { canonical: '/' },
  openGraph: og({ title: 'Seguridad digital para adultos mayores | Tu Nieto Digital', description: 'Kits, sesiones y talleres contra fraudes digitales. Cada compra financia talleres gratuitos en Aguascalientes.', url: '/' }),
};

const Palomita = () => <span className="palomita"><IconoCheck size={11} /></span>;

export default async function Inicio() {
  const articulos = await obtenerArticulos();
  const kit = articulos.find((a) => a.slug === 'kit-tu-nieto-digital');
  const precioKit = kit?.precio ?? 400;
  const porcentaje = kit?.porcentaje_aportacion ?? 30;

  return (
    <>
      <JsonLd datos={{ '@context': 'https://schema.org', '@type': 'Organization', name: SITIO.nombre, url: SITIO.url, logo: `${SITIO.url}/og-tu-nieto-digital.png`, description: SITIO.descripcion, areaServed: 'Aguascalientes, México' }} />

      <section className="hero" aria-labelledby="titulo-inicio">
        <div className="contenedor hero-fila">
          <div className="hero-texto">
            <p className="sobretitulo">Seguridad digital para adultos mayores</p>
            <h1 id="titulo-inicio">Que tus papás reconozcan una estafa <span>antes de caer en ella.</span></h1>
            <p className="hero-desc">Kits, sesiones y talleres para proteger a tu familia de fraudes por WhatsApp y llamadas. Cada compra financia un taller gratuito en Aguascalientes.</p>
            <div className="acciones">
              <Link href="/tienda" className="boton boton-acento">Ver la tienda <IconoFlecha size={18} /></Link>
              <Link href="/como-funciona" className="boton boton-contorno-claro">Cómo funciona</Link>
            </div>
            <ul className="hero-ventajas">
              <li><IconoCheck size={18} /> Compra sin crear cuenta</li>
              <li><IconoCheck size={18} /> Ves tu aportación antes de pagar</li>
              <li><IconoCheck size={18} /> Envío local o recolección</li>
            </ul>
          </div>

          {/* Ilustración del simulador del curso: mensaje ficticio para mostrar cómo se detectan las señales */}
          <figure className="hero-visual" aria-label="Ejemplo del simulador del curso: un mensaje de premio falso marcado como estafa por tres señales">
            <div className="telefono">
              <div className="telefono-pantalla">
                <div className="telefono-contacto">
                  <span className="telefono-avatar" aria-hidden="true">?</span>
                  <div><p>Número desconocido</p><small>+52 ··· ··· 4821</small></div>
                </div>
                <div className="telefono-chat">
                  <p className="burbuja">¡Felicidades! Ganaste una pantalla. Para recibirla paga $199 de envío aquí: <span className="enlace-falso">premio-mx.link/reclama</span><small>10:42</small></p>
                  <div className="veredicto">
                    <p className="veredicto-etiqueta">SIMULADOR · ¿ES ESTAFA?</p>
                    <p className="veredicto-titulo">Sí, es estafa</p>
                    <ol>
                      <li>Un premio que no pediste</li>
                      <li>Te pide pagar para recibirlo</li>
                      <li>Un enlace desconocido</li>
                    </ol>
                  </div>
                  <div className="telefono-botones" aria-hidden="true"><span>Es estafa</span><span>Es seguro</span></div>
                </div>
              </div>
            </div>
            <div className="tarjeta-flotante">
              <p><IconoEscudo size={20} /> Celular protegido</p>
              <ul>
                <li><Palomita /> Verificación en dos pasos</li>
                <li><Palomita /> Desconocidos silenciados</li>
                <li><Palomita /> Copia de seguridad activa</li>
              </ul>
            </div>
          </figure>
        </div>
      </section>

      <section className="contenedor seccion" aria-labelledby="titulo-problema">
        <p className="sobretitulo">El problema</p>
        <div className="seccion-encabezado">
          <h2 id="titulo-problema">Las estafas llegan por donde ellos platican</h2>
          <p>Mensajes y llamadas son la puerta de entrada. Por eso enseñamos a reconocer las señales, no solo a usar el celular.</p>
        </div>
        <ul className="estadisticas">
          <li className="estadistica">
            <p className="cifra">35<span>%</span></p>
            <p>de los fraudes reportados contra adultos mayores llegan por mensajería instantánea.</p>
            <p className="fuente">Fuente: Policía Cibernética, SSC CDMX</p>
          </li>
          <li className="estadistica">
            <p className="cifra">26<span>%</span></p>
            <p>llegan por llamadas y mensajes de texto.</p>
            <p className="fuente">Fuente: Policía Cibernética, SSC CDMX</p>
          </li>
          <li className="estadistica">
            <p className="cifra">49.4<span>%</span></p>
            <p>de los adultos mayores necesita apoyo para hacer trámites digitales.</p>
            <p className="fuente">Fuente: Cámara de Diputados</p>
          </li>
        </ul>
      </section>

      <section className="contenedor seccion" aria-labelledby="titulo-tienda">
        <p className="sobretitulo">Tienda solidaria</p>
        <div className="seccion-encabezado">
          <h2 id="titulo-tienda">Elige cómo protegerlos</h2>
          <Link href="/tienda" className="enlace-flecha">Ver toda la tienda →</Link>
        </div>
        <div className="rejilla">
          {articulos.map((a, i) => <TarjetaArticulo key={a.id} articulo={a} prioridad={i === 0} />)}
        </div>
      </section>

      <section className="banda-menta" aria-labelledby="titulo-pasos">
        <div className="contenedor">
          <p className="sobretitulo">Cómo funciona</p>
          <h2 id="titulo-pasos" style={{ marginBottom: 40 }}>Una compra, dos familias protegidas</h2>
          <ol className="pasos">
            <li><span className="paso-num">01</span><h3>Compras en minutos</h3><p>Eliges el kit, una sesión o un taller. Sin crear cuenta y viendo tu aportación antes de pagar.</p></li>
            <li><span className="paso-num">02</span><h3>Tu familiar aprende</h3><p>Con la guía impresa, el curso en línea y el simulador «¿Es estafa o no?», a su ritmo.</p></li>
            <li><span className="paso-num">03</span><h3>Llevamos un taller gratuito</h3><p>El {porcentaje}% de cada venta se convierte en talleres en centros comunitarios, parroquias o grupos del DIF.</p></li>
          </ol>
        </div>
      </section>

      <section className="contenedor seccion" aria-labelledby="titulo-transparencia">
        <div className="transparencia">
          <div className="transparencia-texto">
            <p className="sobretitulo">Transparencia</p>
            <h2 id="titulo-transparencia">Tu compra, desglosada</h2>
            <p>Antes de pagar ves cuánto de tu compra se va a la comunidad. Cada aportación queda registrada y se asigna a un taller.</p>
            <Link href="/como-funciona#talleres" className="boton boton-acento">Conoce los talleres</Link>
          </div>
          <div className="transparencia-caja">
            <BarraAportacion titulo={kit?.nombre ?? 'Kit Tu Nieto Digital'} precio={precioKit} aporte={aportacionDe(precioKit, porcentaje)} />
            <ul className="chips" aria-label="Dónde se imparten los talleres">
              <li>Centros comunitarios</li><li>Parroquias</li><li>Grupos del DIF</li><li>Comités vecinales</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
