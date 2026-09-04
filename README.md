# Sabor y Origen

Plataforma web integral para restaurantes colombianos. Sitio público de pedidos y reservas, panel de administración completo con 20 secciones y portal de cliente registrado con 9 módulos. PWA instalable, impresión de tickets, dark mode y 100% funcional sin backend.

> **Demo:** [restaurante-hgdsw9piq-javier-1e91.vercel.app](https://restaurante-hgdsw9piq-javier-1e91.vercel.app/)

---

## Tabla de contenidos

- [Características](#características)
- [Secciones](#secciones)
- [Páginas públicas](#páginas-públicas)
- [Panel de administración](#panel-de-administración)
- [Portal de cliente](#portal-de-cliente)
- [Funcionalidades especiales](#funcionalidades-especiales)
- [Stack tecnológico](#stack-tecnológico)
- [Instalación](#instalación)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Almacenamiento de datos](#almacenamiento-de-datos)
- [Acceso](#acceso)
- [Licencia](#licencia)

---

## Características

- **PWA** — Instalable como app en móvil y escritorio, funciona offline con service worker
- **Dark mode** — Tema claro/oscuro persistente en todo el sitio
- **Impresión de tickets** — Imprimir pedidos en impresora térmica (80mm) o A4
- **20 páginas admin** — Gestión completa del restaurante
- **9 módulos de cliente** — Portal personalizado con fidelización
- **18 páginas públicas** — Experiencia completa de pedido y reserva
- **WhatsApp integrado** — Confirmación, seguimiento, chat masivo
- **Exportar CSV** — Tablas admin exportables a Excel
- **Responsive** — Mobile-first, sidebar colapsable en móvil
- **Sin backend** — Datos en localStorage, ideal para restaurantes pequeños

---

## Secciones

```
┌──────────────────────────────────────────────────┐
│                 SABOR Y ORIGEN                   │
├──────────────────────────────────────────────────┤
│                                                  │
│  🌐 SITIO PÚBLICO (18 páginas)                  │
│     Menú, pedidos, reservas, contacto, etc.      │
│                                                  │
│  🛡️ PANEL DE ADMINISTRACIÓN (20 secciones)       │
│     Dashboard, pedidos, cocina, mesas CRUD,      │
│     inventario, finanzas, reportes, etc.         │
│                                                  │
│  👤 PORTAL DE CLIENTE (9 módulos)                │
│     Inicio, perfil, menú, pedidos, puntos,       │
│     recompensas, favoritos, reservas, config.    │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Páginas públicas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Inicio | Hero, categorías slider, destacados, cómo funciona, promociones, FAQ |
| `/menu` | Menú | Catálogo con búsqueda, filtros avanzados (precio, tiempo, picante), categorías |
| `/menu/:id` | Detalle | Imagen, ingredientes, alérgenos, adicionales, ratings, favoritos, compartir |
| `/checkout` | Checkout | Resumen, formulario, envío/recoger/mesa, métodos de pago |
| `/orden-confirmacion/:id` | Confirmación | Estado del pedido, imprimir ticket, WhatsApp, feedback |
| `/seguimiento/:id` | Tracking | Progreso visual: Recibido → Preparando → Listo → Entregado |
| `/reservas` | Reservar | Wizard 4 pasos: personas, fecha/hora, datos, confirmación |
| `/contacto` | Contacto | Info, mapa Google embebido, redes sociales |
| `/resenas` | Reseñas | Calificación promedio, formulario de reseña |
| `/galeria` | Galería | Grid masonry con lightbox |
| `/eventos` | Eventos | Catering, cumpleaños, corporativos |
| `/promociones` | Promociones | Ofertas activas y códigos de descuento |
| `/nosotros` | Nosotros | Historia, valores, estadísticas |
| `/mi-perfil` | Mi perfil | Puntos, nivel de fidelidad, historial |
| `/mis-pedidos` | Pedidos | Búsqueda por ID, reordenar |
| `/login` | Login | Email + contraseña |
| `/registro` | Registro | Formulario de registro |
| `/recuperar-contrasena` | Recuperar | Formulario simulado de recuperación |

---

## Panel de administración

**URL:** `/admin-login` — **Usuario:** `admin` — **Contraseña:** `12345`

Protegido por `AdminGuard`. Layout con sidebar fijo (escritorio) o drawer (móvil).

### Secciones

| Sección | Ruta | Funcionalidad |
|---------|------|---------------|
| **Dashboard** | `/admin-dashboard` | Stats con % cambio vs ayer, gráfico 7 días, top 5 productos, accesos rápidos |
| **Pedidos** | `/admin-ordenes` | Tabla, estados, cambio rápido, WhatsApp, imprimir ticket, exportar CSV |
| **Cocina** | `/admin-cocina` | Kanban: Nuevos → Preparando → Listos, auto-refresh 10s, tiempo transcurrido |
| **Reservas** | `/admin-reservas` | Confirmar/rechazar, WhatsApp automático, editar, exportar CSV |
| **Mesas** | `/admin-mesas` | CRUD completo: crear, editar, eliminar, cambiar estado, grid visual, filtros |
| **Productos** | `/admin-productos` | CRUD con Formik+Yup, imagen, categorías, aditionales, exportar CSV |
| **Clientes** | `/admin-clientes` | Perfiles, niveles fidelidad, historial, exportar CSV |
| **Reseñas** | `/admin-resenas` | Responder, eliminar, distribución estrellas, exportar CSV |
| **WhatsApp** | `/admin-whatsapp` | Envío masivo, 5 plantillas, selección múltiple |
| **Categorías** | `/admin-categorias` | CRUD categorías de productos, conteo, exportar CSV |
| **Promociones** | `/admin-promociones` | CRUD códigos promocionales, toggle activo/inactivo |
| **Inventario** | `/admin-inventario` | Gestión stock inline, badges de estado, filtros |
| **Finanzas** | `/admin-finanzas` | Ingresos, ticket promedio, métodos de pago, gráfico CSS |
| **Reportes** | `/admin-reportes` | Pedidos por hora, categorías vendidas, clientes activos |
| **Segmentación** | `/admin-segmentacion` | VIP, Frecuente, Ocasional, Nuevo, Inactivo |
| **Actividad** | `/admin-actividad` | Timeline de acciones, filtros por entidad |
| **Backup** | `/admin-backup` | Exportar/importar JSON, historial de backups |
| **Horarios** | `/admin-horarios` | Gestión por día, descansos, indicador abierto/cerrado |
| **Configuración** | `/admin-config` | 6 pestañas: General, Horario, Delivery, Reservas, Pagos, Media |

---

## Portal de cliente

**URL:** `/login` — Registro con email + contraseña.

### Módulos (9 pestañas en `/mi-cuenta`)

| Módulo | Funcionalidad |
|--------|---------------|
| **Inicio** | Dashboard con bienvenida, stats, último pedido, acciones rápidas |
| **Perfil** | Avatar, datos, puntos, nivel de fidelidad |
| **Menú** | Buscador integrado, filtros, agregar al carrito directamente |
| **Pedidos** | Historial con estados, repetir pedido, WhatsApp, imprimir |
| **Reservas** | Lista, cancelar con confirmación, WhatsApp |
| **Favoritos** | Grid de favoritos, agregar al carrito, eliminar |
| **Puntos** | Display dorado, barra progreso, niveles (Bronce → Diamante) |
| **Recompensas** | 4 premios canjeables: descuento, bebida, postre, envío gratis |
| **Config** | Editar perfil, notificaciones, privacidad, cerrar sesión |

---

## Funcionalidades especiales

### PWA (Progressive Web App)
- `manifest.json` con theme olive (#667A22), iconos maskable
- Service worker con cache estático + dinámico (network-first)
- Meta tags para iOS/Android (apple-mobile-web-app-capable)
- Instalable desde el navegador

### Impresión de tickets
- Componente `PrintTicket` reutilizable
- Función `imprimirPedido()` callable desde cualquier parte
- Layout optimizado para impresora térmica 80mm o A4
- Botones en: AdminOrdenes (tabla + modal), OrderConfirmation

### Dark mode
- `useTheme` hook con persistencia en localStorage
- Toggle en Header (público), AdminLayout (sidebar), Portal cliente
- Clases `dark:` en body, headings, inputs, cards

### Horarios del restaurante
- Gestión por día de la semana (Lunes-Domingo)
- Hora apertura/cierre por día
- Descanso opcional (almuerzo)
- Indicador en tiempo real: "Abierto ahora" / "Cerrado"
- Acciones rápidos: copiar a todos, abrir/cerrar todos

### WhatsApp
- Botón flotante en todo el sitio
- Confirmación de pedidos automática
- Seguimiento de pedidos
- Envío masivo admin con 5 plantillas
- Contacto desde reservas y pedidos

### Exportar CSV
- Disponible en: Pedidos, Reservas, Productos, Clientes, Reseñas, Categorías, Promociones, Inventario, Actividad, Segmentación, Reportes

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18 | Framework UI |
| TypeScript | 5.2 | Tipado estático |
| Vite | 5.3 | Bundler + HMR |
| Tailwind CSS | 3.4 | Estilos utility-first |
| Zustand | 4.5 | Estado global + persistencia |
| React Router | 6.23 | Enrutamiento SPA |
| Formik + Yup | 2.4 / 1.4 | Formularios + validación |
| Sonner | 1.5 | Notificaciones toast |
| React Icons | 5.2 | Iconos (FontAwesome) |
| clsx | 2.1 | Clases condicionales |
| Vercel | — | Hosting + CI/CD |

---

## Instalación

```bash
# Clonar
git clone https://github.com/guzmanmaceajavier-bit/Restaurante.git
cd restaurante

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

Requisitos: Node.js 18+, npm 9+

---

## Estructura del proyecto

```
restaurante/
├── public/
│   ├── icons/              # Iconos PWA (SVG)
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker
│   └── platos/             # Imágenes de ejemplo
├── src/
│   ├── components/
│   │   ├── admin/          # ExportButton, Pagination, PrintTicket, ProductForm
│   │   ├── cart/           # CartModal, ProductsList, Quantity, TotalOrder
│   │   ├── checkout/       # CheckOutForm, CheckOutView, Summary
│   │   ├── core/           # AdminGuard, BackToTop, ConfirmModal, DarkModeToggle,
│   │   │                   # EmptyState, ErrorBoundary, LoadingSkeleton, ProductCard
│   │   ├── home/           # Categories, FeaturedItems, Hero, HowItWorks, etc.
│   │   ├── menu/           # BannerSection, ProductsSection
│   │   └── menuDetail/     # DetailView
│   ├── hooks/              # useCart, useFavorites, useProducts, useScrollAnimate,
│   │                       # useLoading, useTheme
│   ├── layouts/            # AdminLayout, App.layout, Header, Footer
│   ├── lib/                # config, storage, dataService, seo, promociones, fidelidad
│   ├── mockData/           # mock_data.json (datos iniciales)
│   ├── pages/
│   │   ├── home/           # Hero, Categories, FeaturedItems, Testimonials, FAQ, etc.
│   │   ├── Home.tsx
│   │   ├── Menu.tsx, MenuDetail.tsx
│   │   ├── CheckOut.tsx, OrderConfirmation.tsx, OrderTracking.tsx
│   │   ├── Reserve.tsx, Contact.tsx, Resenas.tsx
│   │   ├── Gallery.tsx, Events.tsx, Promociones.tsx, AboutUs.tsx
│   │   ├── ClientLogin.tsx, ClientPanel.tsx, ForgotPassword.tsx
│   │   ├── MiPerfil.tsx, OrderHistory.tsx
│   │   ├── PoliticaPrivacidad.tsx, TerminosCondiciones.tsx
│   │   ├── AdminDashboard.tsx, AdminOrdenes.tsx, AdminCocina.tsx
│   │   ├── AdminReservas.tsx, AdminMesas.tsx, AdminProductos.tsx
│   │   ├── AdminClientes.tsx, AdminResenas.tsx, AdminWhatsApp.tsx
│   │   ├── AdminCategorias.tsx, AdminPromociones.tsx
│   │   ├── AdminInventario.tsx, AdminFinanzas.tsx
│   │   ├── AdminReportes.tsx, AdminSegmentacion.tsx
│   │   ├── AdminActividad.tsx, AdminBackup.tsx
│   │   ├── AdminHorarios.tsx, AdminConfig.tsx
│   │   └── GestionReserva.tsx
│   ├── routes/             # index.tsx (rutas), routes.ts (paths)
│   ├── store/              # useAuthStore, useCartStore, useClientStore, useProductStore
│   ├── types/              # client.d.ts, order.d.ts, product.d.ts, ReservaData.ts
│   ├── utils/              # numberFormatter
│   └── index.css           # Animaciones, dark mode, estilos globales
├── tailwind.config.js      # Paleta de colores, dark mode, animaciones
├── vite.config.ts          # Configuración Vite
├── tsconfig.json           # TypeScript estricto
└── package.json
```

---

## Almacenamiento de datos

No hay backend. Todo se almacena en `localStorage` del navegador.

| Key | Contenido |
|-----|-----------|
| `productos` | Productos del menú |
| `ordenes` | Pedidos realizados |
| `reservas` | Reservas de mesa |
| `resenas` | Reseñas de clientes |
| `clientes` | Clientes registrados |
| `mesas` | Mesas con estados |
| `categorias` | Categorías de productos |
| `promociones_admin` | Códigos promocionales |
| `activity_log` | Registro de actividad admin |
| `backup_history` | Historial de backups |
| `horarios_config` | Horarios del restaurante |
| `restaurant-config` | Configuración general |
| `cart-storage` | Carrito de compras |
| `auth-client-storage` | Sesión del cliente |
| `admin-auth` | Sesión del admin |
| `theme` | Preferencia de tema (claro/oscuro) |

> Los datos son por navegador. Se inicializan automáticamente con datos de ejemplo de `mockData/mock_data.json`.

---

## Acceso

| Panel | URL | Credenciales |
|-------|-----|--------------|
| Admin | `/admin-login` | `admin` / `12345` |
| Cliente | `/login` | Registro con email + contraseña |

---

## Paleta de colores

| Color | Hex | Uso |
|-------|-----|-----|
| Olive (primario) | `#667A22` | Botones, CTAs, logos, acentos |
| Gold | `#F5B51B` | Highlights, puntos, badges |
| Sage | `#B9C98A` | Fondos decorativos |
| Cream | `#FFF8EA` | Fondo principal |
| Espresso | `#30451D` | Texto principal |
| Emerald | `#059669` | WhatsApp, BackToTop |

---

## Licencia

Proyecto privado — Javier Guzmán

Desplegado en [Vercel](https://restaurante-hgdsw9piq-javier-1e91.vercel.app/)
