# 🍽️ Sabor y Origen — Plataforma Integral de Restaurante

**Sabor y Origen** es una plataforma web completa para restaurantes colombianos que combina un sitio público de pedidos y reservas, un panel de administración total y un portal de cliente registrado. Todo funciona 100% en el navegador sin servidor — los datos se almacenan en `localStorage`.

---

## 📋 Índice

1. [¿De qué trata el proyecto?](#-qué-es)
2. [Cómo está compuesto](#-cómo-está-compuesto)
3. [Páginas públicas](#-páginas-públicas)
4. [Panel de Administración](#-panel-de-administración)
5. [Panel de Cliente](#-panel-de-cliente)
6. [Integraciones](#-integraciones)
7. [Configuración del restaurante](#-configuración-del-restaurante)
8. [Acceso](#-acceso)
9. [Stack tecnológico](#-stack-tecnológico)
10. [Instalación y ejecución](#-instalación-y-ejecución)
11. [Estructura del proyecto](#-estructura-del-proyecto)

---

## 🎯 Qué es

Sabor y Origen es una plataforma web tipo **SaaS (Software as a Service)** diseñada para restaurantes pequeños y medianos en Colombia. Permite:

- Un **sitio público** donde los clientes pueden ver el menú, hacer pedidos (para llevar, recoger o consumir en sitio), reservar mesa, dejar reseñas y ver promociones.
- Un **panel de administración** donde el dueño/gerente puede gestionar TODO: pedidos, cocina, reservas, mesas, productos, clientes, reseñas, WhatsApp masivo y configuración del restaurante.
- Un **portal de cliente** registrado donde puede ver su perfil, historial de pedidos, reservas, favoritos y acumular puntos de fidelidad.

> **No hay backend.** Todos los datos viven en el `localStorage` del navegador. Los pedidos se confirman vía WhatsApp. Ideal para restaurantes que quieren presencia digital sin infraestructura de servidor.

---

## 🧩 Cómo está compuesto

La plataforma se divide en **3 grandes secciones**:

```
┌─────────────────────────────────────────────────┐
│              SABOR Y ORIGEN                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  🌐 SITIO PÚBLICO (18 páginas)                 │
│     → Menú, pedidos, reservas, contacto, etc.   │
│                                                 │
│  🛡️ PANEL DE ADMINISTRACIÓN (11 secciones)      │
│     → Dashboard, pedidos, cocina, reservas...   │
│                                                 │
│  👤 PORTAL DE CLIENTE (5 pestañas)              │
│     → Perfil, pedidos, reservas, favoritos...   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Cada sección tiene su propio layout:**
- **Público:** Header horizontal + Footer compacto + CartModal + WhatsApp flotante
- **Admin:** Sidebar fijo izquierdo (escritorio) / drawer (móvil) + área de contenido
- **Cliente:** Header del público + pestañas internas dentro de `/mi-cuenta`

---

## 🌐 Páginas públicas

Todas las rutas públicas están envueltas en `<AppLayout>` que provee header, footer, carrito y botón de WhatsApp flotante.

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | **Inicio** | Hero con CTA, categorías con slider infinito, platos destacados (carrusel), experiencia gastronómica, cómo funciona, promociones, reservas, testimonios, FAQ, CTA final |
| `/menu` | **Menú** | Catálogo completo con búsqueda, filtros avanzados (precio, tiempo, picante), filtro por categoría, grid de productos |
| `/menu/:id` | **Detalle del plato** | Imagen, descripción, precio, ingredientes, alérgenos, tiempo de preparación, nivel de picante, aditivos opcionales, agregar al carrito |
| `/checkout` | **Checkout** | Resumen del carrito + formulario (nombre, teléfono, dirección, método de pago) + opción de envío/recoger/consumir aquí |
| `/orden-confirmacion/:id` | **Confirmación** | Número de pedido, estado, tiempo estimado, botón WhatsApp para seguimiento, formulario de feedback |
| `/reservas` | **Reservar mesa** | Wizard de 4 pasos: (1) número de personas, (2) fecha/hora con calendario y disponibilidad (verde/amarillo/rojo), (3) datos personales, (4) confirmación con integración Google Calendar |
| `/contacto` | **Contacto** | Tarjetas de información, mapa de Google embebido, redes sociales, CTA WhatsApp |
| `/resenas` | **Reseñas** | Calificación promedio, tarjetas de reseñas, formulario para dejar reseña (nombre, estrellas, comentario) |
| `/galeria` | **Galería** | Grid masonry de 25 platos con lightbox modal |
| `/eventos` | **Eventos** | Servicios de catering, cumpleaños, eventos corporativos, reuniones familiares |
| `/promociones` | **Promociones** | Promociones activas con códigos de descuento y combos especiales |
| `/mi-perfil` | **Mi perfil** | Búsqueda por teléfono, puntos de fidelidad, nivel (bronce/plata/oro), barra de progreso, historial |
| `/mis-pedidos` | **Mis pedidos** | Búsqueda por ID de pedido o historial completo si está logueado, reordenar, seguimiento WhatsApp |
| `/login` | **Iniciar sesión** | Formulario email + contraseña |
| `/registro` | **Registrarse** | Formulario nombre, email, teléfono, contraseña |
| `/mi-cuenta` | **Mi cuenta** | Portal del cliente con 5 pestañas (ver sección abajo) |
| `/politica-privacidad` | **Privacidad** | Política de privacidad estática |
| `/terminos-condiciones` | **Términos** | Términos y condiciones estáticos |

---

## 🛡️ Panel de Administración

### Acceso
- **Ruta:** `/admin-login`
- **Usuario:** `admin`
- **Contraseña:** `12345`

El admin está protegido por `<AdminGuard>` que verifica `localStorage.isAdmin === 'true'`. Todas las rutas admin usan `<AdminLayout>` con sidebar de navegación.

### Estructura del sidebar

```
📊 Dashboard
📋 Pedidos
🍳 Cocina
📅 Reservas
🪑 Mesas
🍕 Productos
👥 Clientes
⭐ Reseñas
📱 WhatsApp
⚙️ Configuración
```

### Detalle de cada sección

#### 📊 Dashboard (`/admin-dashboard`)
- Tarjetas de estadísticas: Pedidos hoy, Ingresos hoy, Reservas hoy, Ticket promedio — cada una con % de cambio vs. ayer
- Gráfico de ventas de los últimos 7 días
- Top 5 productos más vendidos
- Últimos 5 pedidos en tabla
- 8 accesos rápidos a las demás secciones

#### 📋 Pedidos (`/admin-ordenes`)
- Tabla con todos los pedidos: ID, cliente, fecha, artículos, total, estado
- Estados: Recibido → Preparando → Listo → Entregado / Cancelado
- Filtro por estado, búsqueda por ID/nombre/teléfono
- Paginación (10 por página)
- Modal de detalle: info del cliente, desglose de items, cambio de estado con 1 clic
- Enlace WhatsApp para contactar al cliente
- **Exportar a CSV**

#### 🍳 Cocina (`/admin-cocina`)
- Vista tipo **Kanban** en 3 columnas: Nuevos | Preparando | Listos
- Auto-refresco cada 10 segundos
- Cada tarjeta muestra: ID, cliente, tiempo transcurrido (verde <15min, amarillo 15-30min, rojo >30min), lista de items, notas especiales
- Botón "Avanzar" para mover el pedido al siguiente estado

#### 📅 Reservas (`/admin-reservas`)
- Tabla: ID, nombre, fecha, hora, personas, estado
- Estados: Pendiente, Confirmada, Rechazada
- Acciones: Confirmar (genera mensaje WhatsApp automático), Rechazar, Editar (modal con todos los campos), Eliminar, WhatsApp
- Filtro por estado, búsqueda, paginación
- **Exportar a CSV**

#### 🪑 Mesas (`/admin-mesas`)
- **Mapa visual** tipo grid con tarjetas de mesas
- 8 mesas predeterminadas en 4 zonas: Interior, Terraza, Barra, Zona Privada
- Estados con colores: Disponible (verde), Ocupada (roja), Reservada (amarilla), En preparación (azul), Mantenimiento (gris)
- Click en una mesa → modal para cambiar estado
- Filtro por ubicación, estadísticas resumen

#### 🍕 Productos (`/admin-productos`)
- Grid de tarjetas con imagen, nombre, categoría, precio, stock
- Crear producto: formulario completo (Formik + Yup) con nombre, categoría, descripción, precio, stock, descuento %, nivel de picante (0-3), URL imagen, ingredientes, alérgenos, tiempo, calorías, checkboxes (destacado, best seller, recomendado, nuevo), sección de aditivos dinámicos
- Editar producto: mismo formulario pre-cargado
- Eliminar (con confirmación)
- Búsqueda y filtro por categoría
- Paginación (8 por página)
- **Exportar a CSV**

#### 👥 Clientes (`/admin-clientes`)
- Tabla: nombre, email, teléfono, pedidos, total gastado, nivel de fidelidad
- Niveles: Bronce (<5 pedidos), Plata (5-9), Oro (10-19), Diamante (20+)
- Tarjetas resumen: Total, Activos, Diamante, Oro
- Modal de detalle: avatar, info completa, historial de contactos
- Búsqueda y paginación
- **Exportar a CSV**

#### ⭐ Reseñas (`/admin-resenas`)
- Calificación promedio con visualización de estrellas
- Gráfico de distribución (5 a 1 estrellas) — clickeable para filtrar
- Tarjetas de reseñas con avatar, nombre, estrellas, fecha, comentario
- Responder reseña (modal con textarea)
- Eliminar reseña (con confirmación)
- Paginación (8 por página)
- **Exportar a CSV**

#### 📱 WhatsApp (`/admin-whatsapp`)
- Lista de clientes extraídos de pedidos y reservas (deduplicados por teléfono)
- Filtro por fuente: todos, pedidos, reservas
- Selección individual o "Seleccionar todos"
- **5 plantillas de mensajes:** Bienvenida, Promoción, Recordatorio, Cumpleaños, Seguimiento
- Variables: `{nombre}`, `{restaurante}`
- Mensaje personalizado con textarea
- Envío masivo (abre WhatsApp web para cada contacto con 800ms de delay)
- Historial de mensajes enviados

#### ⚙️ Configuración (`/admin-config`)
6 pestañas configurables:

| Pestaña | Opciones |
|---------|----------|
| **General** | Nombre, eslogan, dirección, teléfono, email, número WhatsApp, URL mapa |
| **Horario** | Hora apertura, hora cierre, días activos (toggle) |
| **Delivery** | Envío gratis desde ($), costo delivery ($), radio cobertura (km) |
| **Reservas** | Máximo por día, anticipación mínima (min), política de reserva |
| **Pagos** | Impuesto %, cargo mesero ($), moneda (COP/USD/EUR), métodos de pago (toggle) |
| **Media** | Instagram, Facebook, TikTok, URL logo, URL banner |

---

## 👤 Portal de Cliente

### Acceso
- **Login:** `/login`
- **Registro:** `/registro`
- Los clientes se registran con nombre, email, teléfono y contraseña
- Auth gestionada por Zustand con persistencia en localStorage

### Portal (`/mi-cuenta`) — 5 pestañas

| Pestaña | Funcionalidad |
|---------|---------------|
| **Perfil** | Avatar, nombre, email, teléfono, puntos acumulados, nivel de fidelidad, cantidad de pedidos. Atajos: "Hacer pedido" y "Reservar mesa" |
| **Menú** | Navegador de menú integrado con búsqueda, filtro por categoría, filtros avanzados (precio, tiempo, picante), grid de productos con agregar al carrito y toggle de favoritos |
| **Pedidos** | Lista de pedidos del cliente con estados, items, total. Acciones: Ver detalle, Repetir pedido (agrega todo al carrito), Seguimiento WhatsApp |
| **Reservas** | Lista de reservas del cliente con estados. Acciones: Cancelar, Consulta WhatsApp |
| **Favoritos** | Grid de productos favoritos con eliminar de favoritos y agregar al carrito |

---

## 🔗 Integraciones

| Integración | Ubicación | Descripción |
|-------------|-----------|-------------|
| **WhatsApp** | Todo el sitio | Botón flotante, confirmación de pedidos, seguimiento, reservas, chat masivo admin, contacto |
| **Google Maps** | `/contacto` | Mapa embebido del restaurante (URL configurable desde admin) |
| **Google Calendar** | `/reservas` | Al confirmar reserva se genera evento en Google Calendar |
| **Nequi** | Checkout | Pago móvil colombiano con número visible |
| **Bancolombia** | Checkout | Transferencia bancaria con datos de cuenta |
| **Daviplata** | Checkout | Billetera móvil colombiana |

---

## ⚙️ Configuración del restaurante

La configuración se administra desde `/admin-config` y se guarda en `localStorage` bajo `restaurant-config`. También existen configuraciones hardcoded en `src/lib/config.ts`:

| Sección | Detalles |
|---------|----------|
| **Reservas** | Máximo 12 personas por mesa, 4 zonas (Terraza, Interior, Barra, Zona Privada), 5 tipos de ocasiones, extras (decoración $15K, pastel $25K, vino $35K) |
| **Delivery** | Envío $5,000, gratis desde $50,000, 9 barrios, tiempos: delivery 45min, recoger 20min, mesa 15min |
| **Pagos** | Efectivo, Nequi, Bancolombia, Daviplata con datos de cuenta |
| **Promociones** | 3 promociones activas con códigos de descuento |
| **Combos** | Combo Familiar ($55K), Combo Pareja ($45K) |
| **Fidelidad** | 1 punto por $10K gastados, 100 puntos = canje, niveles: bronce/plata/oro |
| **Redes** | Instagram, Facebook, WhatsApp |

---

## 🔐 Acceso

| Panel | URL | Credenciales |
|-------|-----|--------------|
| **Admin** | `/admin-login` | `admin` / `12345` |
| **Cliente** | `/login` | Registro con email + contraseña |

> Los datos se guardan en `localStorage` del navegador. No hay backend — cada navegador tiene sus propios datos.

---

## 🛠️ Stack tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.2.2 | Tipado estático |
| Vite | 5.3.1 | Bundler + HMR |
| Tailwind CSS | 3.4.4 | Estilos utility-first |
| Zustand | 4.5.2 | Estado global + persistencia |
| React Router | 6.23.1 | Enrutamiento SPA |
| Formik | 2.4.6 | Formularios |
| Yup | 1.4.0 | Validación de schemas |
| Sonner | 1.5.0 | Notificaciones toast |
| React Icons | 5.2.1 | Iconos (FontAwesome, BoxIcons) |
| clsx | 2.1.1 | Clases condicionales |
| **Deploy** | Vercel | Hosting + CI/CD automático |

---

## 🚀 Instalación y ejecución

```bash
# Clonar el repositorio
git clone https://github.com/guzmanmaceajavier-bit/Restaurante.git
cd restaurante

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

---

## 📁 Estructura del proyecto

```
restaurante/
├── src/
│   ├── components/
│   │   ├── admin/          # ProductForm, Pagination, ExportButton
│   │   ├── cart/           # CartModal, ProductsList, Quantity, TotalOrder
│   │   ├── checkout/       # CheckOutForm, CheckOutView, Summary
│   │   ├── core/           # AdminGuard, BackToTop, ProductCard, WhatsAppButton
│   │   ├── home/           # ProductsSlider
│   │   ├── menu/           # BannerSection, ProductsSection
│   │   └── menuDetail/     # DetailView
│   ├── hooks/              # useCart, useFavorites, useProducts, useScrollAnimate
│   ├── layouts/            # AdminLayout, App.layout, Header, Footer, Sidebar
│   ├── lib/                # config, storage, fidelidad, promociones, seo
│   ├── mockData/           # mock_data.json (datos iniciales)
│   ├── pages/
│   │   ├── home/           # Hero, Categories, FeaturedItems, Promos, etc.
│   │   ├── Home.tsx
│   │   ├── Menu.tsx
│   │   ├── MenuDetail.tsx
│   │   ├── Reserve.tsx
│   │   ├── Contact.tsx
│   │   ├── Checkout.tsx
│   │   ├── OrderConfirmation.tsx
│   │   ├── ClientLogin.tsx
│   │   ├── ClientPanel.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminOrdenes.tsx
│   │   ├── AdminCocina.tsx
│   │   ├── AdminReservas.tsx
│   │   ├── AdminMesas.tsx
│   │   ├── AdminProductos.tsx
│   │   ├── AdminClientes.tsx
│   │   ├── AdminResenas.tsx
│   │   ├── AdminWhatsApp.tsx
│   │   ├── AdminConfig.tsx
│   │   └── GestionReserva.tsx
│   ├── routes/             # index.tsx (rutas), routes.ts (paths)
│   ├── store/              # useAuthStore, useCartStore, useClientStore, useProductStore
│   ├── types/              # client.d.ts, order.d.ts, product.d.ts, ReservaData.ts
│   └── utils/              # numberFormatter
├── public/
├── tailwind.config.js
├── vite.config.ts
├── vercel.json
└── package.json
```

---

## 📦 Datos

**No hay backend.** Todo se almacena en `localStorage` del navegador:

| Key | Contenido |
|-----|-----------|
| `productos` | Array de productos del menú |
| `ordenes` | Array de pedidos realizados |
| `reservas` | Array de reservas |
| `resenas` | Array de reseñas |
| `clientes` | Array de clientes registrados |
| `mesas` | Array de mesas con estados |
| `restaurant-config` | Configuración del restaurante |
| `cart-storage` | Carrito de compras |
| `auth-client-storage` | Sesión del cliente |
| `whatsapp-historial` | Historial de mensajes WhatsApp |

> **Nota:** Los datos son por navegador. Si cambias de navegador o limpias el historial, se pierden los datos. Se inicializa automáticamente con datos de ejemplo de `mockData/mock_data.json`.

---

**Desarrollado por Javier Guzmán** — Proyecto desplegado en [Vercel](https://restaurante-hgdsw9piq-javier-1e91.vercel.app/)
