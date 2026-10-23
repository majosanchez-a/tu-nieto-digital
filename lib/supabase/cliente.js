// Cliente de Supabase para el navegador: usa SOLO la llave pública.
// Lo que puede leer está limitado por las políticas RLS de 01_esquema.sql.
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
