import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ConfirmacionPedido } from '@/components/ConfirmacionPedido';

export const metadata: Metadata = { title: 'Pedido registrado', robots: { index: false, follow: false } };

async function Folio({ params }: Pick<PageProps<'/pedido/[folio]'>, 'params'>) {
  const { folio } = await params;
  const limpio = decodeURIComponent(folio).replace(/[^A-Z0-9-]/gi, '').slice(0, 20);
  return <ConfirmacionPedido folio={limpio} />;
}

export default function Pedido(props: PageProps<'/pedido/[folio]'>) {
  return (
    <div className="contenedor pagina">
      <Suspense fallback={<p className="estado-carga" role="status">Cargando tu pedido…</p>}>
        <Folio params={props.params} />
      </Suspense>
    </div>
  );
}
