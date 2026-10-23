// Verifica que el entorno local llega a Supabase con la llave pública.
// No es una prueba funcional: solo confirma la conexión y que RLS protege los pedidos.
// Uso: npm run verificar
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const llave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !llave) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(url, llave);
const tablas = ['articulos', 'variantes', 'modulos', 'casos_simulador', 'pedidos', 'aliados'];

console.log('Tu Nieto Digital · verificación de conexión con Supabase\n');
for (const tabla of tablas) {
  const { count, error } = await supabase.from(tabla).select('*', { count: 'exact', head: true });
  if (error) console.log(`  ✗ ${tabla}: ${error.message}`);
  else console.log(`  ✓ ${tabla}: ${count} registros visibles con la llave pública`);
}
console.log('\n"pedidos" y "aliados" deben mostrar 0: están protegidos por RLS para la llave pública.');