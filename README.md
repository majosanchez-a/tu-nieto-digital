# Tu Nieto Digital · Interfaz del piloto

Tienda solidaria de seguridad digital para adultos mayores: las familias compran el kit, sesiones o talleres y una parte de cada compra financia talleres gratuitos en colonias de Aguascalientes.

- **Sitio publicado:** https://tu-nieto-digital.vercel.app
- **Tecnología:** Next.js 16 (App Router, TypeScript, Cache Components) · Supabase (PostgreSQL + RLS) · Vercel
- **Tipografías:** Sora (títulos), DM Sans (texto) y JetBrains Mono (cifras), guardadas en `app/fonts` con licencia SIL OFL
- **Equipo:** María José Sánchez y Juan Carlos González · Taller de Proyecto Social Integrador

## Cómo ejecutarlo

Requisitos: Node.js 20 o más nuevo.

```bash
npm install
cp .env.example .env.local   # en Windows: copia el archivo y renómbralo
npm run dev                  # http://localhost:3000
```

| Variable | Para qué | ¿Obligatoria? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase | Para leer el catálogo real |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Llave pública (lectura limitada por RLS) | Para leer el catálogo real |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave secreta, solo servidor | Para guardar pedidos |
| `NEXT_PUBLIC_SITE_URL` | Dominio para canonical, sitemap y Open Graph | No (por defecto, el de Vercel) |

**Sin llaves el proyecto también funciona:** usa los datos de prueba de `lib/demo.ts`, muestra un aviso de "modo demostración" y los pedidos no se guardan. El repositorio no contiene contraseñas, llaves ni datos personales.

Otros comandos: `npm run build` (compilación de producción), `npm start` (servidor de producción), `npm run lint` y `npm run verificar` (conexión con Supabase).

## Mapa de páginas y rutas

| Ruta | Página | Componentes principales | Requisitos | Indexable |
| --- | --- | --- | --- | --- |
| `/` | Inicio: propuesta de valor, cómo funciona, destacados, categorías, impacto | `TarjetaArticulo`, `JsonLd` (Organization) | R-013, R-017 | Sí |
| `/tienda` | Catálogo con búsqueda `?q=` y filtro `?categoria=` | `TarjetaArticulo`, `Migas` | R-013 | Sí (canonical a `/tienda`) |
| `/tienda/[slug]` | Detalle: imagen, precio, disponibilidad, versión, horario o monto, agregar al carrito | `AgregarAlCarrito`, `Migas`, `JsonLd` (Product) | R-013, R-014, R-016, R-017, R-020 | Sí |
| `/carrito` | Carrito: cantidades, eliminar, subtotal y aportación | `VistaCarrito` | R-015, R-017 | No (`noindex`) |
| `/checkout` | Datos, entrega, aviso de privacidad y pago de demostración | `FormularioCheckout`, acción `crearPedido` | R-015, R-018, R-019, R-025 | No (`noindex`) |
| `/pedido/[folio]` | Confirmación con folio y resumen | `ConfirmacionPedido` | R-021 | No (`noindex`) |
| `/como-funciona` | Modelo solidario, talleres y preguntas frecuentes | `Migas` | R-020, R-022 | Sí |
| `/aviso-de-privacidad` | Datos que se piden y cómo se protegen | `Migas` | R-025 | Sí |
| `/sitemap.xml` · `/robots.txt` | Rastreo para buscadores | `app/sitemap.ts`, `app/robots.ts` | SEO | — |

Estados compartidos: `app/loading.tsx` (carga), `app/error.tsx` (error), `app/not-found.tsx` (404), estados vacíos de catálogo, carrito y checkout, y avisos de confirmación.

## Componentes y organización

```
app/                      Páginas (App Router), metadatos SEO, sitemap y robots
  checkout/acciones.ts    Acción de servidor: valida, recalcula precios y registra el pedido
components/               Componentes reutilizables
  Encabezado, PieDePagina, BotonCarrito, AvisoDemo   Estructura y navegación
  TarjetaArticulo, Migas, JsonLd                     Catálogo, ruta de navegación y datos estructurados
  AgregarAlCarrito, VistaCarrito                     Compra y carrito (cliente)
  FormularioCheckout, ConfirmacionPedido             Cierre del pedido (cliente)
lib/
  datos.ts                Lectura del catálogo (Supabase o demostración), con caché de minutos
  carrito.tsx             Estado del carrito en localStorage (compartido entre páginas y pestañas)
  formato.ts, sitio.ts, seo.ts, tipos.ts, demo.ts
  supabase/               Clientes de Supabase: público (navegador) y servidor (llave secreta)
public/                   Ilustraciones con nombres descriptivos e imagen para redes
```

## Qué está conectado, qué es simulado y qué sigue pendiente

| Función | Estado | Detalle |
| --- | --- | --- |
| Catálogo, precios, versiones, existencias y horarios | **Conectado** | Se leen de Supabase con la llave pública (RLS) |
| Carrito | **Implementado** | En el navegador (localStorage); no requiere cuenta |
| Registro del pedido | **Conectado** | Se guarda en Supabase como `pendiente`, con precios recalculados en el servidor |
| Horario de la sesión | **Conectado** | Se aparta al registrar el pedido |
| Pago | **Simulado** | Indicado en pantalla; Mercado Pago (Checkout Pro) tiene credenciales de prueba listas |
| Envío | **Simulado** | Se registra la opción y el domicilio; no hay paquetería conectada |
| Inventario | **Pendiente** | Se descontará cuando exista pago aprobado |
| Correo de confirmación (Resend) | **Pendiente** | La confirmación se muestra en pantalla |
| Curso, simulador y mapa de impacto | **Pendiente** | Siguiente etapa |

## Decisiones técnicas

- Los precios nunca se toman del navegador: la acción `crearPedido` los recalcula con la base de datos (R-026).
- La categoría del catálogo se deriva del tipo de artículo, porque la base aún no tiene columna de categoría.
- Las imágenes son ilustraciones propias en `public/` porque la columna `imagen_url` todavía está vacía.
- El modelo de caché de Next.js 16 (*Cache Components*) mantiene el catálogo en caché unos minutos; las páginas que leen la URL usan `<Suspense>`.
