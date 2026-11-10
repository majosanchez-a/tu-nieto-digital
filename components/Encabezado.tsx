import Link from 'next/link';
import { BotonCarrito } from './BotonCarrito';
import { Escudo } from './Escudo';
import { IconoBuscar } from './Iconos';

export function Encabezado() {
  return (
    <>
      <p className="barra-anuncio">Cada compra lleva un taller gratuito a una colonia de Aguascalientes · <strong>30%</strong> va a talleres</p>
      <header className="encabezado">
        <div className="contenedor encabezado-fila">
          <Link href="/" className="marca" aria-label="Tu Nieto Digital, ir al inicio">
            <Escudo />
            <span className="marca-nombre">Tu Nieto <span>Digital</span></span>
          </Link>
          <nav aria-label="Principal" className="nav-principal">
            <Link href="/tienda">Tienda</Link>
            <Link href="/como-funciona">Cómo funciona</Link>
            <Link href="/como-funciona#talleres">Talleres</Link>
          </nav>
          <form action="/tienda" method="get" role="search" className="buscador">
            <label htmlFor="buscar" className="solo-lectores">Buscar en la tienda</label>
            <IconoBuscar size={20} />
            <input id="buscar" name="q" type="search" placeholder="Buscar kits, sesiones o talleres" autoComplete="off" />
            <button type="submit" className="solo-lectores">Buscar</button>
          </form>
          <BotonCarrito />
        </div>
      </header>
    </>
  );
}
