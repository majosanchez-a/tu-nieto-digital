import Link from 'next/link';

export default function NoEncontrado() {
  return (
    <div className="contenedor pagina estado-vacio">
      <h1>No encontramos esta página</h1>
      <p>Puede que el enlace esté mal escrito o que el artículo ya no esté disponible.</p>
      <div className="acciones acciones-centro">
        <Link href="/tienda" className="boton boton-principal">Ir a la tienda</Link>
        <Link href="/" className="boton boton-secundario">Volver al inicio</Link>
      </div>
    </div>
  );
}
