-- Tu Nieto Digital · Datos de prueba FICTICIOS (precios y nombres de ejemplo)
-- Ejecutar después de 01_esquema.sql. Ningún dato es de una persona real.

insert into public.articulos (slug, nombre, tipo, descripcion, incluye, precio, precio_minimo, duracion_min, cupo_maximo, porcentaje_aportacion) values
 ('kit-tu-nieto-digital', 'Kit Tu Nieto Digital', 'producto', 'Material para reconocer y evitar estafas por WhatsApp, llamadas y redes sociales.',
  array['Guía impresa con las reglas clave', 'Tarjetas para practicar «¿Es estafa o no?»', 'Acceso al curso en línea', 'Código QR de acceso'], 400, null, null, null, 30),
 ('sesion-personalizada', 'Sesión personalizada', 'servicio', 'Configuramos su celular y le enseñamos, a domicilio o por videollamada.',
  array['Configuración de seguridad del celular', 'Práctica con el simulador'], 350, null, 60, 1, 30),
 ('taller-para-empresas', 'Taller para empresas', 'servicio', 'Capacitación en seguridad digital en las instalaciones del cliente.',
  array['Taller presencial', 'Material para participantes'], 3000, null, 120, 20, 30),
 ('regala-un-taller', 'Regala un taller', 'aportacion', 'Patrocinio total o parcial de un taller gratuito en una colonia.',
  array['Aportación directa a talleres comunitarios'], null, 100, null, null, 100);

insert into public.variantes (articulo_id, nombre, existencias)
select id, v.nombre, 10 from public.articulos, (values ('Android'), ('iPhone')) as v(nombre)
where slug = 'kit-tu-nieto-digital';

insert into public.horarios (articulo_id, inicio, fin, modalidad)
select id, h.inicio, h.fin, h.modalidad::modalidad_servicio from public.articulos,
  (values ('2026-11-14 10:00-06'::timestamptz, '2026-11-14 11:00-06'::timestamptz, 'domicilio'),
          ('2026-11-14 12:00-06'::timestamptz, '2026-11-14 13:00-06'::timestamptz, 'videollamada')) as h(inicio, fin, modalidad)
where slug = 'sesion-personalizada';

insert into public.modulos (orden, titulo, resumen, publicado) values
 (1, 'Celular y WhatsApp seguros', 'Bloqueo de pantalla y verificación en dos pasos.', true),
 (2, 'Fraudes por llamada', 'Falso familiar, falso banco y extorsión: cuelga y marca tú.', true),
 (3, 'Fraudes por mensaje', 'Enlaces sospechosos, premios falsos y robo de cuenta con código.', true),
 (4, 'Redes sociales', 'Estafas románticas, perfiles falsos y falso soporte técnico.', true),
 (5, '¿Y si ya caí?', 'Bloquear la tarjeta, avisar a tus contactos y denunciar.', true);

insert into public.casos_simulador (modulo_id, categoria, contenido, es_estafa, explicacion, senales)
select m.id, c.categoria::categoria_caso, c.contenido, c.es_estafa, c.explicacion, c.senales
from (values
  (3, 'banco', 'Tu cuenta fue bloqueada. Entra a este enlace para reactivarla hoy mismo.', true,
   'Los bancos no piden datos por enlaces en mensajes.', array['Urgencia', 'Enlace desconocido', 'Pide datos']),
  (2, 'llamada', 'Abuelita, soy tu nieto. Estoy en problemas, no le digas a nadie y deposítame.', true,
   'Pide secreto y dinero urgente sin decir su nombre.', array['Pide secreto', 'Pide dinero urgente', 'No dice su nombre']),
  (3, 'mensaje', 'Recordatorio: tu cita en el centro de salud es mañana a las 9:00.', false,
   'Solo informa; no pide datos, dinero ni que abras enlaces.', array['No pide datos ni dinero', 'No trae enlaces'])
) as c(orden, categoria, contenido, es_estafa, explicacion, senales)
join public.modulos m on m.orden = c.orden;

insert into public.aliados (institucion, tipo, zona, contacto_nombre, contacto_correo, acepto_privacidad)
values ('Centro Comunitario Ejemplo', 'centro_comunitario', 'Colonia Ejemplo', 'Contacto de prueba', 'contacto@ejemplo.org', true);

insert into public.solicitudes_taller (aliado_id, fecha_tentativa, asistentes_aprox, conectividad)
select id, '2026-11-28', 20, 'sin_internet' from public.aliados where institucion = 'Centro Comunitario Ejemplo';

-- Pedido de prueba (pago simulado) con su detalle, entrega y aportación
with p as (
  insert into public.pedidos (comprador_nombre, comprador_correo, estado, subtotal, costo_envio, aportacion_social, metodo_pago, referencia_pago, acepto_privacidad)
  values ('Comprador de prueba', 'prueba@ejemplo.com', 'aprobado', 800, 0, 240, 'tarjeta (modo de pruebas)', 'SANDBOX-0001', true)
  returning id
), d as (
  insert into public.detalle_pedido (pedido_id, articulo_id, variante_id, cantidad, precio_unitario, aportacion_unitaria)
  select p.id, a.id, v.id, 2, 400, 120
  from p, public.articulos a join public.variantes v on v.articulo_id = a.id and v.nombre = 'Android'
  where a.slug = 'kit-tu-nieto-digital'
  returning pedido_id
), e as (
  insert into public.entregas (pedido_id, tipo, costo, punto_recoleccion)
  select id, 'recoleccion', 0, 'Punto acordado de prueba' from p
  returning pedido_id
)
insert into public.aportaciones (tipo, pedido_id, monto)
select 'porcentaje_venta', id, 240 from p;
