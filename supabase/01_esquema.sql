-- =====================================================================
-- Tu Nieto Digital · Esquema inicial de la base de datos (Supabase / PostgreSQL 15+)
-- Ejecutar completo en: Supabase > SQL Editor > New query > Run
-- Cada tabla indica los requisitos (R-xxx) del levantamiento que atiende.
-- No contiene credenciales ni datos personales reales.
-- =====================================================================

-- ---------- Tipos (listas cerradas) ----------
create type rol_equipo          as enum ('administrador', 'capturista');
create type tipo_articulo       as enum ('producto', 'servicio', 'aportacion');
create type estado_pedido       as enum ('pendiente', 'aprobado', 'rechazado', 'cancelado');
create type tipo_entrega        as enum ('envio_local', 'recoleccion');
create type estado_entrega      as enum ('preparacion', 'en_camino', 'entregado');
create type estado_horario      as enum ('libre', 'reservado');
create type modalidad_servicio  as enum ('domicilio', 'videollamada', 'instalaciones_cliente');
create type tipo_aportacion     as enum ('porcentaje_venta', 'patrocinio');
create type tipo_aliado         as enum ('centro_comunitario', 'parroquia', 'dif', 'comite_vecinal', 'escuela', 'otro');
create type tipo_conectividad   as enum ('con_internet', 'sin_internet', 'desconocida');
create type estado_solicitud    as enum ('nueva', 'en_revision', 'confirmada', 'rechazada');
create type estado_taller       as enum ('programado', 'realizado', 'cancelado');
create type momento_cuestionario as enum ('antes', 'despues');
create type categoria_caso      as enum ('llamada', 'mensaje', 'redes_sociales', 'banco', 'premio', 'soporte_tecnico');

-- ---------- Función para la columna actualizado_en ----------
create or replace function public.marcar_actualizacion()
returns trigger language plpgsql as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

-- =====================================================================
-- 1. EQUIPO (R-023)
-- =====================================================================
create table public.perfiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nombre     text not null,
  rol        rol_equipo not null default 'capturista',
  creado_en  timestamptz not null default now()
);

-- =====================================================================
-- 2. TIENDA SOLIDARIA (R-013 a R-022)
-- =====================================================================
create table public.articulos (                       -- R-013, R-017
  id                     uuid primary key default gen_random_uuid(),
  slug                   text not null unique,
  nombre                 text not null,
  tipo                   tipo_articulo not null,
  descripcion            text not null,
  incluye                text[] not null default '{}',
  precio                 numeric(10,2) check (precio >= 0),
  precio_minimo          numeric(10,2) check (precio_minimo >= 0),
  duracion_min           integer check (duracion_min > 0),
  cupo_maximo            integer check (cupo_maximo > 0),
  porcentaje_aportacion  numeric(5,2) not null default 30 check (porcentaje_aportacion between 0 and 100),
  imagen_url             text,
  activo                 boolean not null default true,
  creado_en              timestamptz not null default now(),
  actualizado_en         timestamptz not null default now(),
  constraint articulo_con_precio check (precio is not null or precio_minimo is not null)
);

create table public.variantes (                       -- R-014 (inventario por variante)
  id           uuid primary key default gen_random_uuid(),
  articulo_id  uuid not null references public.articulos (id) on delete cascade,
  nombre       text not null,
  existencias  integer not null default 0 check (existencias >= 0),
  unique (articulo_id, nombre)
);

create table public.horarios (                        -- R-016 (agenda de servicios)
  id           uuid primary key default gen_random_uuid(),
  articulo_id  uuid not null references public.articulos (id) on delete cascade,
  inicio       timestamptz not null,
  fin          timestamptz not null,
  modalidad    modalidad_servicio not null,
  estado       estado_horario not null default 'libre',
  check (fin > inicio),
  unique (articulo_id, inicio)
);

create sequence public.pedidos_folio_seq;

create table public.pedidos (                         -- R-015, R-017, R-018, R-021, R-025
  id                  uuid primary key default gen_random_uuid(),
  folio               text not null unique default ('TND-' || lpad(nextval('public.pedidos_folio_seq')::text, 4, '0')),
  usuario_id          uuid references auth.users (id) on delete set null,   -- vacío = compra como invitado
  comprador_nombre    text not null,
  comprador_correo    text not null check (comprador_correo ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  comprador_telefono  text,
  estado              estado_pedido not null default 'pendiente',
  subtotal            numeric(10,2) not null default 0 check (subtotal >= 0),
  costo_envio         numeric(10,2) not null default 0 check (costo_envio >= 0),
  aportacion_social   numeric(10,2) not null default 0 check (aportacion_social >= 0),
  total               numeric(10,2) generated always as (subtotal + costo_envio) stored,
  metodo_pago         text,
  referencia_pago     text,                                                -- id de la pasarela en modo de pruebas
  acepto_privacidad   boolean not null check (acepto_privacidad),
  creado_en           timestamptz not null default now(),
  actualizado_en      timestamptz not null default now()
);

create table public.detalle_pedido (                  -- R-015, R-016
  id                   uuid primary key default gen_random_uuid(),
  pedido_id            uuid not null references public.pedidos (id) on delete cascade,
  articulo_id          uuid not null references public.articulos (id),
  variante_id          uuid references public.variantes (id),
  horario_id           uuid unique references public.horarios (id),        -- un horario solo se reserva una vez
  cantidad             integer not null check (cantidad > 0),
  precio_unitario      numeric(10,2) not null check (precio_unitario >= 0),
  aportacion_unitaria  numeric(10,2) not null default 0 check (aportacion_unitaria >= 0),
  importe              numeric(10,2) generated always as (cantidad * precio_unitario) stored
);

create table public.entregas (                        -- R-019, R-025
  id                 uuid primary key default gen_random_uuid(),
  pedido_id          uuid not null unique references public.pedidos (id) on delete cascade,
  tipo               tipo_entrega not null,
  costo              numeric(10,2) not null default 0 check (costo >= 0),
  calle              text,
  colonia            text,
  codigo_postal      text check (codigo_postal ~ '^[0-9]{5}$'),
  referencias        text,
  punto_recoleccion  text,
  estado             estado_entrega not null default 'preparacion',
  actualizado_en     timestamptz not null default now(),
  constraint domicilio_solo_con_envio check (
    (tipo = 'envio_local' and calle is not null and colonia is not null and codigo_postal is not null)
    or (tipo = 'recoleccion' and calle is null and colonia is null and codigo_postal is null)
  )
);

-- =====================================================================
-- 3. TALLERES COMUNITARIOS E IMPACTO (R-009 a R-012, R-020, R-022)
-- =====================================================================
create table public.aliados (                         -- R-011, R-025
  id                 uuid primary key default gen_random_uuid(),
  institucion        text not null,
  tipo               tipo_aliado not null,
  zona               text not null,
  contacto_nombre    text not null,
  contacto_correo    text,
  contacto_telefono  text,
  acepto_privacidad  boolean not null check (acepto_privacidad),
  creado_en          timestamptz not null default now(),
  check (contacto_correo is not null or contacto_telefono is not null)
);

create table public.solicitudes_taller (              -- R-011
  id                uuid primary key default gen_random_uuid(),
  aliado_id         uuid not null references public.aliados (id) on delete cascade,
  fecha_tentativa   date not null,
  asistentes_aprox  integer check (asistentes_aprox > 0),
  conectividad      tipo_conectividad not null default 'desconocida',
  estado            estado_solicitud not null default 'nueva',
  comentarios       text,
  creado_en         timestamptz not null default now()
);

create table public.talleres (                        -- R-010, R-012
  id              uuid primary key default gen_random_uuid(),
  aliado_id       uuid not null references public.aliados (id),
  solicitud_id    uuid unique references public.solicitudes_taller (id) on delete set null,
  zona            text not null,
  lugar           text not null,
  latitud         numeric(9,6) check (latitud between -90 and 90),
  longitud        numeric(9,6) check (longitud between -180 and 180),
  fecha           timestamptz not null,
  estado          estado_taller not null default 'programado',
  asistentes      integer check (asistentes >= 0),
  costo_estimado  numeric(10,2) check (costo_estimado >= 0),
  creado_en       timestamptz not null default now()
);

create table public.aportaciones (                    -- R-017, R-020, R-022
  id         uuid primary key default gen_random_uuid(),
  tipo       tipo_aportacion not null,
  pedido_id  uuid references public.pedidos (id) on delete set null,
  taller_id  uuid references public.talleres (id) on delete set null,   -- vacío = aún no asignada a un taller
  monto      numeric(10,2) not null check (monto > 0),
  creado_en  timestamptz not null default now()
);

create table public.gastos (                          -- R-022
  id               uuid primary key default gen_random_uuid(),
  taller_id        uuid not null references public.talleres (id) on delete cascade,
  concepto         text not null,
  monto            numeric(10,2) not null check (monto > 0),
  fecha            date not null default current_date,
  comprobante_url  text,
  creado_en        timestamptz not null default now()
);

create table public.cuestionarios (                   -- R-009 (anónimo: solo folio, zona por taller y fecha)
  id               uuid primary key default gen_random_uuid(),
  taller_id        uuid not null references public.talleres (id) on delete cascade,
  folio            text not null,
  momento          momento_cuestionario not null,
  aciertos         integer not null check (aciertos >= 0),
  total_preguntas  integer not null check (total_preguntas > 0),
  creado_en        timestamptz not null default now(),
  check (aciertos <= total_preguntas),
  unique (taller_id, folio, momento)
);

-- =====================================================================
-- 4. CURSO EN LÍNEA Y SIMULADOR (R-001 a R-004)
-- =====================================================================
create table public.modulos (                         -- R-003
  id            uuid primary key default gen_random_uuid(),
  orden         smallint not null unique check (orden between 1 and 20),
  titulo        text not null,
  resumen       text not null,
  video_url     text,
  duracion_seg  integer check (duracion_seg between 1 and 180),   -- videos de máximo 3 minutos
  publicado     boolean not null default false
);

create table public.casos_simulador (                 -- R-001, R-002
  id           uuid primary key default gen_random_uuid(),
  modulo_id    uuid references public.modulos (id) on delete set null,
  categoria    categoria_caso not null,
  contenido    text not null,
  imagen_url   text,
  es_estafa    boolean not null,
  explicacion  text not null,
  senales      text[] not null default '{}',
  activo       boolean not null default true,
  creado_en    timestamptz not null default now(),
  check (cardinality(senales) >= 2)
);

create table public.progreso_modulos (                -- R-003, R-004 (sin datos personales)
  id              uuid primary key default gen_random_uuid(),
  dispositivo_id  text not null,
  modulo_id       uuid not null references public.modulos (id) on delete cascade,
  origen          text,                                 -- zona o kit del QR
  completado_en   timestamptz not null default now(),
  unique (dispositivo_id, modulo_id)
);

-- ---------- Índices para las relaciones más consultadas ----------
create index on public.variantes (articulo_id);
create index on public.horarios (articulo_id, estado);
create index on public.pedidos (estado);
create index on public.pedidos (usuario_id);
create index on public.detalle_pedido (pedido_id);
create index on public.detalle_pedido (articulo_id);
create index on public.solicitudes_taller (aliado_id, estado);
create index on public.talleres (estado, fecha);
create index on public.aportaciones (taller_id);
create index on public.gastos (taller_id);
create index on public.cuestionarios (taller_id);
create index on public.casos_simulador (modulo_id);

-- ---------- Disparadores de fecha de actualización ----------
create trigger articulos_actualizado before update on public.articulos for each row execute function public.marcar_actualizacion();
create trigger pedidos_actualizado   before update on public.pedidos   for each row execute function public.marcar_actualizacion();
create trigger entregas_actualizado  before update on public.entregas  for each row execute function public.marcar_actualizacion();

-- ---------- Vistas para el mapa de impacto y la transparencia ----------
create view public.v_resumen_talleres with (security_invoker = true) as   -- R-010
select
  t.id, t.zona, t.fecha, t.asistentes, t.latitud, t.longitud,
  round(100 * avg(c.aciertos::numeric / c.total_preguntas) filter (where c.momento = 'antes'), 1)   as promedio_antes,
  round(100 * avg(c.aciertos::numeric / c.total_preguntas) filter (where c.momento = 'despues'), 1) as promedio_despues
from public.talleres t
left join public.cuestionarios c on c.taller_id = t.id
where t.estado = 'realizado'
group by t.id;

create view public.v_transparencia with (security_invoker = true) as      -- R-022
select
  t.id as taller_id, t.zona, t.fecha,
  coalesce((select sum(a.monto) from public.aportaciones a where a.taller_id = t.id), 0) as aportado,
  coalesce((select sum(g.monto) from public.gastos g where g.taller_id = t.id), 0)       as gastado
from public.talleres t;

-- =====================================================================
-- 5. SEGURIDAD: Row Level Security (R-023, R-025, R-026)
--    El navegador usa la llave pública (anon). Pedidos, aliados y solicitudes
--    se escriben desde el servidor con la llave de servicio, que nunca va al navegador.
-- =====================================================================
create or replace function public.es_equipo() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid());
$$;

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'administrador');
$$;

alter table public.perfiles           enable row level security;
alter table public.articulos          enable row level security;
alter table public.variantes          enable row level security;
alter table public.horarios           enable row level security;
alter table public.pedidos            enable row level security;
alter table public.detalle_pedido     enable row level security;
alter table public.entregas           enable row level security;
alter table public.aliados            enable row level security;
alter table public.solicitudes_taller enable row level security;
alter table public.talleres           enable row level security;
alter table public.aportaciones       enable row level security;
alter table public.gastos             enable row level security;
alter table public.cuestionarios      enable row level security;
alter table public.modulos            enable row level security;
alter table public.casos_simulador    enable row level security;
alter table public.progreso_modulos   enable row level security;

-- Lectura pública de lo que se muestra en el sitio
create policy "publico ve articulos activos"   on public.articulos       for select to anon, authenticated using (activo or public.es_equipo());
create policy "publico ve variantes"           on public.variantes       for select to anon, authenticated using (true);
create policy "publico ve horarios libres"     on public.horarios        for select to anon, authenticated using (estado = 'libre' or public.es_equipo());
create policy "publico ve talleres"            on public.talleres        for select to anon, authenticated using (estado <> 'cancelado' or public.es_equipo());
create policy "publico ve resultados anonimos" on public.cuestionarios   for select to anon, authenticated using (true);
create policy "publico ve aportaciones"        on public.aportaciones    for select to anon, authenticated using (true);
create policy "publico ve gastos"              on public.gastos          for select to anon, authenticated using (true);
create policy "publico ve modulos publicados"  on public.modulos         for select to anon, authenticated using (publicado or public.es_equipo());
create policy "publico ve casos activos"       on public.casos_simulador for select to anon, authenticated using (activo or public.es_equipo());
create policy "publico registra su progreso"   on public.progreso_modulos for insert to anon, authenticated with check (true);

-- Compradores con cuenta ven solo sus pedidos
create policy "comprador ve sus pedidos"  on public.pedidos        for select to authenticated using (usuario_id = auth.uid() or public.es_equipo());
create policy "comprador ve su detalle"   on public.detalle_pedido for select to authenticated using (public.es_equipo() or exists (select 1 from public.pedidos p where p.id = pedido_id and p.usuario_id = auth.uid()));
create policy "comprador ve su entrega"   on public.entregas       for select to authenticated using (public.es_equipo() or exists (select 1 from public.pedidos p where p.id = pedido_id and p.usuario_id = auth.uid()));

-- Equipo: capturista registra talleres y cuestionarios; administrador, todo
create policy "equipo ve su perfil"         on public.perfiles           for select to authenticated using (id = auth.uid() or public.es_admin());
create policy "equipo ve aliados"           on public.aliados            for select to authenticated using (public.es_equipo());
create policy "equipo ve solicitudes"       on public.solicitudes_taller for select to authenticated using (public.es_equipo());
create policy "equipo ve progreso"          on public.progreso_modulos   for select to authenticated using (public.es_equipo());
create policy "equipo registra talleres"    on public.talleres           for insert to authenticated with check (public.es_equipo());
create policy "equipo actualiza talleres"   on public.talleres           for update to authenticated using (public.es_equipo()) with check (public.es_equipo());
create policy "equipo registra cuestionarios" on public.cuestionarios    for insert to authenticated with check (public.es_equipo());

create policy "admin perfiles"      on public.perfiles           for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin articulos"     on public.articulos          for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin variantes"     on public.variantes          for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin horarios"      on public.horarios           for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin pedidos"       on public.pedidos            for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin detalle"       on public.detalle_pedido     for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin entregas"      on public.entregas           for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin aliados"       on public.aliados            for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin solicitudes"   on public.solicitudes_taller for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin talleres"      on public.talleres           for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin aportaciones"  on public.aportaciones       for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin gastos"        on public.gastos             for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin cuestionarios" on public.cuestionarios      for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin modulos"       on public.modulos            for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin casos"         on public.casos_simulador    for all to authenticated using (public.es_admin()) with check (public.es_admin());
