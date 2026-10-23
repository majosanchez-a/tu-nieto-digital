-- Tu Nieto Digital · Bucket de imágenes (solo en Supabase). R-002, R-013
-- Ejecutar después de 01_esquema.sql
insert into storage.buckets (id, name, public)
values ('imagenes', 'imagenes', true)
on conflict (id) do nothing;

create policy "lectura publica de imagenes"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'imagenes');

create policy "admin sube imagenes"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'imagenes' and public.es_admin());

create policy "admin borra imagenes"
  on storage.objects for delete to authenticated
  using (bucket_id = 'imagenes' and public.es_admin());
