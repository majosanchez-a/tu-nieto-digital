export type TipoArticulo = 'producto' | 'servicio' | 'aportacion';
export type Categoria = 'familia' | 'empresa' | 'comunidad';

export interface Variante {
  id: string;
  nombre: string;
  existencias: number;
}

export interface Horario {
  id: string;
  inicio: string;
  fin: string;
  modalidad: 'domicilio' | 'videollamada' | 'instalaciones_cliente';
}

export interface Articulo {
  id: string;
  slug: string;
  nombre: string;
  tipo: TipoArticulo;
  descripcion: string;
  incluye: string[];
  precio: number | null;
  precio_minimo: number | null;
  duracion_min: number | null;
  cupo_maximo: number | null;
  porcentaje_aportacion: number;
  variantes: Variante[];
  horarios: Horario[];
}

export interface ItemCarrito {
  clave: string;
  slug: string;
  nombre: string;
  tipo: TipoArticulo;
  precioUnitario: number;
  porcentajeAportacion: number;
  cantidad: number;
  varianteId?: string;
  varianteNombre?: string;
  horarioId?: string;
  horarioTexto?: string;
}
