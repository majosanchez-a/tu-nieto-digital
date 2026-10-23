// Cliente de Supabase para rutas de servidor (pedidos, solicitudes de taller, aliados).
// Usa la llave secreta: este archivo nunca debe importarse desde un componente del navegador.
import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function supabaseServidor() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}
