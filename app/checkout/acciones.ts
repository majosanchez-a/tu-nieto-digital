'use server';

import { obtenerArticulos } from '@/lib/datos';
import { supabaseServidor } from '@/lib/supabase/servidor';
import { SITIO, supabaseConfigurado } from '@/lib/sitio';
import { aportacionDe, textoHorario } from '@/lib/formato';
import type { Articulo } from '@/lib/tipos';

export interface LineaResumen { nombre: string; detalle?: string; cantidad: number; importe: number }
export interface ResumenPedido { lineas: LineaResumen[]; subtotal: number; envio: number; total: number; aportacion: number; entrega?: string }
export interface EstadoPedido {
  ok: boolean;
  mensaje?: string;
  errores?: Record<string, string>;
  valores?: Record<string, string>;
  folio?: string;
  simulado?: boolean;
  resumen?: ResumenPedido;
}

interface EntradaCarrito { slug: string; varianteId?: string; horarioId?: string; cantidad: number; precioUnitario: number }

const texto = (fd: FormData, campo: string) => String(fd.get(campo) ?? '').trim();

/**
 * Registra el pedido. Los precios se recalculan en el servidor con los datos de la base
 * (nunca se confía en los montos que manda el navegador). El PAGO es una demostración:
 * no se llama a Mercado Pago en esta etapa.
 */
export async function crearPedido(_previo: EstadoPedido, fd: FormData): Promise<EstadoPedido> {
  const valores = {
    nombre: texto(fd, 'nombre'), correo: texto(fd, 'correo'), telefono: texto(fd, 'telefono'),
    entrega: texto(fd, 'entrega'), calle: texto(fd, 'calle'), colonia: texto(fd, 'colonia'),
    cp: texto(fd, 'cp'), referencias: texto(fd, 'referencias'),
  };

  let entradas: EntradaCarrito[] = [];
  try {
    entradas = JSON.parse(texto(fd, 'carrito') || '[]');
  } catch {
    return { ok: false, mensaje: 'No pudimos leer tu carrito. Recarga la página e intenta de nuevo.', valores };
  }
  if (!Array.isArray(entradas) || entradas.length === 0) {
    return { ok: false, mensaje: 'Tu carrito está vacío. Agrega un artículo antes de finalizar la compra.', valores };
  }

  let catalogo: Articulo[];
  try {
    catalogo = await obtenerArticulos();
  } catch {
    return { ok: false, mensaje: 'No pudimos conectar con la tienda en este momento. Intenta de nuevo en unos minutos.', valores };
  }

  // 1) Validar artículos y recalcular precios
  const lineas: { articulo: Articulo; cantidad: number; precio: number; aportacion: number; varianteId?: string; horarioId?: string; detalle?: string }[] = [];
  for (const e of entradas) {
    const articulo = catalogo.find((a) => a.slug === e.slug);
    const cantidad = Math.max(1, Math.min(Number(e.cantidad) || 1, 10));
    if (!articulo) return { ok: false, mensaje: 'Uno de los artículos ya no está disponible. Revisa tu carrito.', valores };

    let precio = articulo.precio ?? 0;
    let detalle: string | undefined;
    if (articulo.tipo === 'aportacion') {
      precio = Math.round(Number(e.precioUnitario) || 0);
      const minimo = articulo.precio_minimo ?? 0;
      if (precio < minimo || precio > 100000) {
        return { ok: false, mensaje: `La aportación debe ser de al menos $${minimo}. Ajústala en tu carrito.`, valores };
      }
    }
    if (articulo.tipo === 'producto') {
      const variante = articulo.variantes.find((v) => v.id === e.varianteId);
      if (!variante) return { ok: false, mensaje: `Elige la versión del ${articulo.nombre} en tu carrito.`, valores };
      if (variante.existencias < cantidad) {
        return { ok: false, mensaje: `Solo quedan ${variante.existencias} piezas de ${articulo.nombre} (${variante.nombre}).`, valores };
      }
      detalle = `Versión ${variante.nombre}`;
    }
    if (articulo.tipo === 'servicio' && articulo.horarios.length > 0) {
      const horario = articulo.horarios.find((h) => h.id === e.horarioId);
      if (!horario) return { ok: false, mensaje: `El horario elegido para ${articulo.nombre} ya no está disponible.`, valores };
      detalle = textoHorario(horario);
    }
    lineas.push({ articulo, cantidad, precio, aportacion: aportacionDe(precio, articulo.porcentaje_aportacion), varianteId: e.varianteId, horarioId: e.horarioId, detalle });
  }

  // 2) Validar datos del formulario
  const errores: Record<string, string> = {};
  if (valores.nombre.length < 3) errores.nombre = 'Escribe tu nombre completo.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(valores.correo)) errores.correo = 'Escribe un correo válido, por ejemplo nombre@correo.com.';
  if (valores.telefono && !/^\d{10}$/.test(valores.telefono.replace(/\D/g, ''))) errores.telefono = 'El WhatsApp debe tener 10 dígitos.';
  const hayProducto = lineas.some((l) => l.articulo.tipo === 'producto');
  if (hayProducto && !['envio_local', 'recoleccion'].includes(valores.entrega)) errores.entrega = 'Elige cómo quieres recibir el kit.';
  if (hayProducto && valores.entrega === 'envio_local') {
    if (!valores.calle) errores.calle = 'Escribe la calle y el número.';
    if (!valores.colonia) errores.colonia = 'Escribe la colonia.';
    if (!/^\d{5}$/.test(valores.cp)) errores.cp = 'El código postal debe tener 5 dígitos.';
  }
  if (fd.get('privacidad') !== 'on') errores.privacidad = 'Para continuar, acepta el aviso de privacidad.';
  if (Object.keys(errores).length > 0) {
    return { ok: false, errores, valores, mensaje: 'Revisa los campos marcados para continuar.' };
  }

  // 3) Totales
  const subtotal = lineas.reduce((s, l) => s + l.precio * l.cantidad, 0);
  const envio = hayProducto && valores.entrega === 'envio_local' ? SITIO.costoEnvioLocal : 0;
  const aportacion = lineas.reduce((s, l) => s + l.aportacion * l.cantidad, 0);
  const resumen: ResumenPedido = {
    lineas: lineas.map((l) => ({ nombre: l.articulo.nombre, detalle: l.detalle, cantidad: l.cantidad, importe: l.precio * l.cantidad })),
    subtotal, envio, total: subtotal + envio, aportacion,
    entrega: hayProducto ? (valores.entrega === 'envio_local' ? 'Envío local en Aguascalientes' : 'Recolección en punto acordado') : undefined,
  };

  // 4) Sin llave de servidor: pedido 100% de demostración (no se guarda nada)
  if (!supabaseConfigurado || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: true, simulado: true, folio: `DEMO-${Math.floor(1000 + Math.random() * 9000)}`, resumen };
  }

  // 5) Con Supabase: el pedido SÍ se registra (estado pendiente). El pago sigue siendo simulado.
  const sb = supabaseServidor();

  // El catálogo se cachea unos minutos: antes de guardar, confirmamos en la base que los horarios sigan libres.
  const horariosPedidos = lineas.map((l) => l.horarioId).filter((h): h is string => Boolean(h));
  if (horariosPedidos.length > 0) {
    const { data: libres } = await sb.from('horarios').select('id').in('id', horariosPedidos).eq('estado', 'libre');
    if ((libres ?? []).length !== horariosPedidos.length) {
      return { ok: false, mensaje: 'El horario que elegiste para la sesión acaba de ser reservado. Vuelve al artículo y elige otro.', valores };
    }
  }
  const { data: pedido, error } = await sb
    .from('pedidos')
    .insert({
      comprador_nombre: valores.nombre,
      comprador_correo: valores.correo,
      comprador_telefono: valores.telefono || null,
      estado: 'pendiente',
      subtotal,
      costo_envio: envio,
      aportacion_social: aportacion,
      metodo_pago: 'demostración: pago simulado',
      acepto_privacidad: true,
    })
    .select('id, folio')
    .single();
  if (error || !pedido) return { ok: false, mensaje: 'No pudimos registrar tu pedido. Intenta de nuevo en unos minutos.', valores };

  const { error: errorDetalle } = await sb.from('detalle_pedido').insert(
    lineas.map((l) => ({
      pedido_id: pedido.id,
      articulo_id: l.articulo.id,
      variante_id: l.varianteId ?? null,
      horario_id: l.horarioId ?? null,
      cantidad: l.cantidad,
      precio_unitario: l.precio,
      aportacion_unitaria: l.aportacion,
    }))
  );
  if (errorDetalle) {
    // Sin detalle el pedido no sirve: se borra para no dejar registros incompletos.
    await sb.from('pedidos').delete().eq('id', pedido.id);
    return { ok: false, mensaje: 'No pudimos registrar tu pedido. Intenta de nuevo en unos minutos.', valores };
  }
  // El horario queda apartado al registrar el pedido; el inventario se descontará cuando exista pago real (pendiente).
  if (horariosPedidos.length > 0) await sb.from('horarios').update({ estado: 'reservado' }).in('id', horariosPedidos);

  if (hayProducto) {
    await sb.from('entregas').insert(
      valores.entrega === 'envio_local'
        ? { pedido_id: pedido.id, tipo: 'envio_local', costo: envio, calle: valores.calle, colonia: valores.colonia, codigo_postal: valores.cp, referencias: valores.referencias || null }
        : { pedido_id: pedido.id, tipo: 'recoleccion', costo: 0, punto_recoleccion: 'Punto acordado por WhatsApp' }
    );
  }
  const porVenta = lineas.filter((l) => l.articulo.tipo !== 'aportacion').reduce((s, l) => s + l.aportacion * l.cantidad, 0);
  const patrocinio = lineas.filter((l) => l.articulo.tipo === 'aportacion').reduce((s, l) => s + l.aportacion * l.cantidad, 0);
  const aportes = [
    ...(porVenta > 0 ? [{ tipo: 'porcentaje_venta', pedido_id: pedido.id, monto: porVenta }] : []),
    ...(patrocinio > 0 ? [{ tipo: 'patrocinio', pedido_id: pedido.id, monto: patrocinio }] : []),
  ];
  if (aportes.length) await sb.from('aportaciones').insert(aportes);

  return { ok: true, simulado: false, folio: pedido.folio, resumen };
}
