export default function Cargando() {
  return (
    <div className="contenedor pagina" role="status" aria-live="polite">
      <p className="solo-lectores">Cargando…</p>
      <div className="esqueleto esqueleto-titulo" />
      <div className="rejilla">
        {[1, 2, 3].map((n) => <div key={n} className="esqueleto esqueleto-tarjeta" />)}
      </div>
    </div>
  );
}
