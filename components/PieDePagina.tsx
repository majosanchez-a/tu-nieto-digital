import Link from 'next/link';

export function PieDePagina() {
  return (
    <footer className="pie">
      <div className="contenedor pie-fila">
        <div className="pie-marca">
          <p>Tu Nieto <span>Digital</span></p>
          <p>Tienda solidaria de seguridad digital para adultos mayores. Aguascalientes, México.</p>
        </div>
        <nav aria-label="Productos" className="pie-columna">
          <p>TIENDA</p>
          <Link href="/tienda/kit-tu-nieto-digital">Kit Tu Nieto Digital</Link>
          <Link href="/tienda/sesion-personalizada">Sesión personalizada</Link>
          <Link href="/tienda/taller-para-empresas">Taller para empresas</Link>
          <Link href="/tienda/regala-un-taller">Regala un taller</Link>
        </nav>
        <nav aria-label="Proyecto" className="pie-columna">
          <p>PROYECTO</p>
          <Link href="/como-funciona">Cómo funciona</Link>
          <Link href="/como-funciona#talleres">Talleres gratuitos</Link>
          <Link href="/aviso-de-privacidad">Aviso de privacidad</Link>
        </nav>
      </div>
      <p className="contenedor pie-nota">Proyecto escolar · Taller de Proyecto Social Integrador · Los pagos están en modo de demostración: no se realiza ningún cobro.</p>
    </footer>
  );
}
