// Íconos SVG decorativos (aria-hidden): el texto del botón o enlace da el significado.
type P = { size?: number };
const base = (size = 20) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true });
export const IconoCarrito = ({ size }: P) => (<svg {...base(size)}><path d="M3 4h2l2.4 11h10.2l2-8H6.2" /><circle cx="9.5" cy="19.5" r="1.5" /><circle cx="17" cy="19.5" r="1.5" /></svg>);
export const IconoBuscar = ({ size }: P) => (<svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>);
export const IconoEscudo = ({ size }: P) => (<svg {...base(size)}><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg>);
export const IconoCorazon = ({ size }: P) => (<svg {...base(size)}><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" /></svg>);
export const IconoCheck = ({ size }: P) => (<svg {...base(size)}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
export const IconoAlerta = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.5" /></svg>);
export const IconoBasura = ({ size }: P) => (<svg {...base(size)}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>);
export const IconoCamion = ({ size }: P) => (<svg {...base(size)}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" /></svg>);
export const IconoUbicacion = ({ size }: P) => (<svg {...base(size)}><path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /></svg>);
export const IconoMensaje = ({ size }: P) => (<svg {...base(size)}><path d="M4 5h16v11H9l-5 4z" /></svg>);
export const IconoFlecha = ({ size }: P) => (<svg {...base(size)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const IconoLibro = ({ size }: P) => (<svg {...base(size)}><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" /><path d="M8 7h6M8 11h6" /></svg>);
export const IconoTarjetas = ({ size }: P) => (<svg {...base(size)}><rect x="3" y="6" width="13" height="15" rx="2" /><path d="M8 3h11a2 2 0 0 1 2 2v12" /></svg>);
export const IconoQR = ({ size }: P) => (<svg {...base(size)}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v7h-6" /></svg>);
export const IconoVideo = ({ size }: P) => (<svg {...base(size)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9l5 3-5 3z" /></svg>);
