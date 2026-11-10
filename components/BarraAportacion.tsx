import { dinero } from '@/lib/formato';

// Barra que reparte el precio entre el artículo (con su operación) y la aportación a talleres.
// Usa solo los datos reales del artículo: precio y porcentaje de aportación.
export function BarraAportacion({ titulo, precio, aporte, variante = 'oscura' }: { titulo: string; precio: number; aporte: number; variante?: 'oscura' | 'clara' }) {
  const resto = precio - aporte;
  const pctAporte = precio > 0 ? Math.round((aporte / precio) * 100) : 0;
  const etiqueta = `De ${dinero(precio)}, ${dinero(resto)} cubren el artículo y la operación y ${dinero(aporte)} van a talleres gratuitos`;
  if (variante === 'clara') {
    return (
      <div className="aporte-detalle">
        <div className="barra-aporte-encabezado"><span>Así se reparte tu compra</span><span>{dinero(aporte)} a talleres gratuitos</span></div>
        <div className="barra-aporte" role="img" aria-label={etiqueta}>
          <div className="barra-aporte-resto" style={{ flex: 100 - pctAporte }} />
          <div className="barra-aporte-taller" style={{ flex: pctAporte }} />
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="barra-aporte-encabezado"><span>{titulo}</span><span className="cifra-mono">{dinero(precio)}</span></div>
      <div className="barra-aporte" role="img" aria-label={etiqueta}>
        <div className="barra-aporte-resto" style={{ flex: 100 - pctAporte }} />
        <div className="barra-aporte-taller" style={{ flex: pctAporte }} />
      </div>
      <dl className="barra-aporte-leyenda">
        <div><dt>Artículo y operación</dt><dd>{dinero(resto)}</dd></div>
        <div><dt>Talleres gratuitos</dt><dd>{dinero(aporte)}</dd></div>
      </dl>
    </div>
  );
}
