# 🍽️ Sabor y Origen — Plataforma Digital de Restaurante Colombiano

## Descripción

**Sabor y Origen** es una aplicación web completa para la gestión integral de un restaurante colombiano. Permite a los clientes explorar el menú, realizar pedidos, hacer reservas de mesa, y comunicarse directamente con el restaurante por WhatsApp. El sistema incluye un panel de administración para gestionar pedidos, reservas, clientes y campañas de marketing.

---

## ¿Para quién está hecho?

### Clientes (público general)
- Personas que desean **ordenar comida a domicilio**, recoger en el local, o comer en el restaurante
- Personas que quieren **reservar una mesa** de forma rápida y sencilla
- Clientes frecuentes que buscan **acumular puntos** y obtener descuentos por fidelidad
- Cualquier usuario que quiera **explorar el menú**, ver platos, ingredientes, precios y reseñas

### Administrador del restaurante
- El **propietario o gerente** del restaurante que necesita controlar los pedidos, reservas y clientes
- El equipo de **atención al cliente** que gestiona comunicaciones por WhatsApp
- El personal de **marketing** que envía promociones y ofertas a clientes

---

## Funcionalidades principales

### 🛒 Menú y Pedidos
- Catálogo completo de 25 platos colombianos con 4 categorías (platos fuertes, entradas, postres, bebidas)
- Búsqueda por nombre y filtros por categoría
- Detalle de cada producto: ingredientes, alérgenos, nivel de picante, calorías, tiempo de preparación
- Carrito de compras con persistencia (se guarda aunque cierres el navegador)
- Checkout en 4 pasos: tipo de pedido → datos personales → pago → confirmación
- 3 tipos de pedido: comer en el restaurante, a domicilio, recoger en el local
- Métodos de pago: efectivo, Nequi, Bancolombia, Daviplata
- Programación de pedidos para hora específica
- Envío del pedido completo por WhatsApp al restaurante

### 📋 Reservas de Mesa
- Formulario completo: nombre, email, teléfono, fecha, hora, personas, zona, ocasión, comentarios
- Selección de zona: Terraza, Interior, Barra, Zona Privada
- Ocasiones especiales: Cumpleaños, Aniversario, Reunión empresarial, Romántica
- Confirmación inmediata por WhatsApp
- Gestión pública de reservas (buscar y editar por ID o email)

### ⭐ Programa de Fidelidad
- Acumulación automática de puntos: 1 punto por cada $10,000 en compras
- 3 niveles de cliente:
  - **Bronce** (0-499 puntos): Sin descuento adicional
  - **Plata** (500-1499 puntos): 5% de descuento
  - **Oro** (1500+ puntos): 10% de descuento
- Canjeo de puntos: 100 puntos = $5,000 de descuento
- Perfil de cliente con historial de pedidos, puntos acumulados y progreso hacia el siguiente nivel

### 📊 Panel de Administración
- **Dashboard** con estadísticas del día: pedidos, reservas, ingresos, clientes únicos
- **Gráficos de ventas** de los últimos 7 días (barras horizontales)
- **Top 5 productos** más vendidos con ranking visual
- **Horas pico**: cuándo se realizan más pedidos
- **Clientes frecuentes**: ranking de clientes por número de pedidos
- **Gestión de pedidos**: cambiar estados (recibido → preparando → listo → entregado → cancelado)
- **Gestión de reservas**: confirmar, rechazar, editar, eliminar
- **Filtros y búsqueda** en pedidos y reservas por estado, tipo, nombre, teléfono
- **Alertas** de pedidos pendientes por atender

### 📱 WhatsApp Integrado
- **Botón flotante** de WhatsApp en todas las páginas
- **Envío de pedidos** completos por WhatsApp con formato detallado
- **Confirmación de reservas** por WhatsApp
- **Envío masivo de mensajes** a todos los clientes
- **5 plantillas predefinidas**: bienvenida, promoción, recordatorio, cumpleaños, seguimiento
- **Reemplazo automático de variables**: {nombre}, {restaurante}
- **Historial de mensajes** enviados
- **Segmentación** de clientes por origen (pedidos/reservas)

### 📝 Reseñas
- Sistema de reseñas con calificación de 1-5 estrellas
- Promedio de estrellas visible
- Fecha de publicación
- Persistencia en localStorage

### 🖼️ Contenido Adicional
- **Galería de fotos** de platos con lightbox
- **Página de eventos**: cumpleaños, reuniones empresariales, catering
- **Promociones y combos**: ofertas vigentes y paquetes especiales
- **Contacto**: información, mapa de Google embebido, redes sociales

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.2.2 | Tipado estático |
| Vite | 5.3.1 | Bundler y dev server |
| React Router DOM | 6.23.1 | Enrutamiento SPA |
| Zustand | 4.5.2 | State management (carrito, clientes) |
| Formik | 2.4.6 | Formularios |
| Yup | 1.4.0 | Validación de formularios |
| Tailwind CSS | 3.4.4 | Estilos utilitarios |
| Sonner | 1.5.0 | Notificaciones toast |
| React Icons | 5.2.1 | Iconografía |

---

## Cómo ejecutar

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Build para producción
npm run build

# Vista previa del build
npm run serve
```

---

## Estructura del proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── cart/         # Carrito de compras
│   ├── checkout/     # Formulario de checkout
│   ├── core/         # WhatsAppButton, BackToTop, ProductCard
│   ├── home/         # Slider de productos
│   └── menu/         # Banner, sección de productos
├── layouts/          # AppLayout, Header, Footer
├── lib/              # Configuración, storage, fidelidad, SEO
├── pages/            # Todas las páginas (20+)
├── routes/           # Definición de rutas
├── store/            # Zustand stores (carrito, clientes)
├── types/            # Interfaces TypeScript
└── utils/            # Utilidades (formateo de números)
```

---

## Rutas principales

| Ruta | Descripción |
|---|---|
| `/` | Página principal |
| `/menu` | Catálogo de productos |
| `/reservas` | Formulario de reserva |
| `/checkout` | Proceso de compra |
| `/resenas` | Reseñas de clientes |
| `/mi-perfil` | Perfil y puntos del cliente |
| `/admin-login` | Login administrador |
| `/admin-dashboard` | Panel de control |
| `/admin-ordenes` | Gestión de pedidos |
| `/admin-reservas` | Gestión de reservas |
| `/admin-whatsapp` | Envío masivo de mensajes |

---

## Notas importantes

- **Sin backend**: Todos los datos se almacenan en `localStorage` del navegador
- **WhatsApp**: Los mensajes se abren en wa.me (navegador), no usa API de WhatsApp Business
- **Autenticación admin**: Básica (usuario: `admin`, contraseña: `12345`) — solo para demostración
- **Diseño responsive**: Funciona en desktop, tablet y móvil
- **PWA básica**: Service worker para caché de rutas principales
