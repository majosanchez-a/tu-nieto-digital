import { supabaseConfigurado } from '@/lib/sitio';

// Se muestra solo cuando el proyecto corre sin conexión a Supabase (datos locales de prueba).
export function AvisoDemo() {
  if (supabaseConfigurado) return null;
  return (
    <div className="aviso-demo" role="note">
      Modo demostración: se muestran datos de prueba locales porque Supabase no está configurado en este entorno.
    </div>
  );
}
