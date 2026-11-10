'use client';

import Link from 'next/link';

export default function ErrorGeneral({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="contenedor pagina estado-vacio" role="alert">
      <h1>Algo salió mal</h1>
      <p>No pudimos cargar esta sección. Revisa tu conexión e intenta de nuevo.</p>
      <div className="acciones acciones-centro">
        <button type="button" className="boton boton-principal" onClick={reset}>Intentar de nuevo</button>
        <Link href="/" className="boton boton-secundario">Volver al inicio</Link>
      </div>
    </div>
  );
}
