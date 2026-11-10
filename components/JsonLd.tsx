// Inserta datos estructurados (schema.org). Se escapa "<" para evitar inyección de HTML.
export function JsonLd({ datos }: { datos: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, '\\u003c') }} />;
}
