# Sabor y Origen

Sistema web completo de gestion y pedidos para restaurante colombiano. Incluye sitio publico, portal de cliente registrado y panel administrativo con 20+ modulos.

**Demo:** [restaurante-hgdsw9piq-javier-1e91.vercel.app](https://restaurante-hgdsw9piq-javier-1e91.vercel.app/demo)

---

## Demo

Accede a la demo completa en **[/demo](https://restaurante-hgdsw9piq-javier-1e91.vercel.app/demo)** desde donde puedes explorar las 3 interfaces:

| Interfaz | Credenciales | Descripcion |
|---|---|---|
| Sitio publico | -- | Menu, carrito, checkout, reservas, contacto |
| Portal cliente | `cliente@demo.com` / `Demo123` | Pedidos, reservas, favoritos, fidelidad, perfil |
| Panel admin | `admin` / `12345` | Dashboard, pedidos, cocina, mesas, inventario, caja, clientes |

Los datos de demostracion se cargan automaticamente (18 pedidos, 12 reservas, 6 clientes, 4 reseñas).

---

## Funcionalidades

### Sitio publico
- Menu con 25+ platos colombianos (imagenes reales)
- Carrito de compras con multiples metodos de pago
- Checkout con domicilio, recoger o mesa
- Sistema de reservas con zonas y extras
- Pagina de promociones y eventos
- Galeria de fotos
- Formulario de contacto
- Resenas de clientes

### Portal cliente
- Historial de pedidos con seguimiento en tiempo real
- Historial de reservas con cancelacion
- Lista de favoritos
- Direcciones guardadas
- Sistema de fidelidad (puntos, niveles, canjes)
- Perfil con Formik/Yup
- Descarga de datos en JSON

### Panel administrativo
- Dashboard con metricas en tiempo real
- Gestion de pedidos (recibido -> preparando -> listo -> entregado)
- Cocina con vista de pedidos activos
- Control de mesas (ocupada/reservada/disponible)
- Gestion de reservas con confirmacion/rechazo
- Catalogo de productos con CRUD
- Inventario con control de stock
- Clientes unificados con historial
- Caja con ingresos/egresos
- Facturacion
- Compras y proveedores
- Fidelizacion con niveles (bronce/plata/oro)
- Promociones y descuentos
- Eventos
- Actividad del sistema
- Configuracion del restaurante
- Usuarios y permisos
- WhatsApp integrado

---

## Arquitectura

```
Frontend SPA (Single Page Application)
├── Persistencia local (localStorage + Zustand)
├── Datos simulados (mock data + seed demo)
└── Preparado para conectar API y base de datos
```

**Para produccion:** Esta version utiliza datos simulados y persistencia local. La arquitectura esta preparada para reemplazar esa capa por una API REST y una base de datos real.

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React 18 | UI library |
| TypeScript 5 | Type safety |
| Vite 5 | Build tool |
| Tailwind CSS 3 | Styling |
| Zustand 4 | State management |
| Formik + Yup | Forms + validation |
| Framer Motion 10 | Animaciones |
| React Router 6 | Routing |
| Sonner | Notificaciones |
| React Icons | Iconografia |

---

## Estructura del proyecto

```
restaurante/
├── public/
│   ├── platos/          # 25 imagenes de platos colombianos
│   ├── icons/           # PWA icons
│   ├── manifest.json    # PWA manifest
│   └── sw.js            # Service worker
├── src/
│   ├── assets/          # Logos, banners, imagenes
│   ├── components/
│   │   ├── admin/       # Componentes admin (StatCard, PrintTicket, etc.)
│   │   ├── cart/        # Carrito de compras
│   │   ├── checkout/    # Formulario de pago
│   │   ├── core/        # Componentes compartidos
│   │   ├── home/        # Slider de productos
│   │   ├── menu/        # Secciones del menu
│   │   └── menuDetail/  # Detalle de producto
│   ├── demo/            # Configuracion y datos de demostracion
│   ├── hooks/           # Custom hooks (useCart, useFavorites, etc.)
│   ├── layouts/         # AppLayout, AdminLayout, ClientLayout
│   ├── lib/             # Utilidades (config, storage, fidelidad, etc.)
│   ├── mockData/        # Datos iniciales del menu
│   ├── pages/           # 42 paginas (22 admin + 20 public/client)
│   ├── routes/          # Rutas de la aplicacion
│   ├── store/           # Zustand stores (auth, admin)
│   ├── types/           # Tipos TypeScript
│   └── utils/           # Utilidades generales
├── README.md
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## Instalacion

```bash
# Clonar repositorio
git clone https://github.com/guzmanmaceajavier-bit/Restaurante.git

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
http://localhost:5173/demo
```

---

## Credenciales de demo

| Rol | Usuario | Contrasena |
|---|---|---|
| Administrador | `admin` | `12345` |
| Cliente | `cliente@demo.com` | `Demo123` |

---

## Decisiones tecnicas

- **Sin backend:** Para una demo de portafolio, los datos se persisten en localStorage. Esto permite que cualquier persona pueda probar el flujo completo sin configurar un servidor.
- **Zustand + persist:** El store de autenticacion se sincroniza con localStorage, permitiendo que los datos del cliente (pedidos, reservas, puntos) sobrevivan entre sesiones.
- **Mock data seed:** Los datos de demostracion se cargan automaticamente la primera vez, haciendo que el sistema parezca realmente utilizado.
- **Preparado para produccion:** La arquitectura esta diseniada para reemplazar la capa de persistencia local por una API REST sin cambiar la UI.

---

## Autor

Desarrollado por **Javier Guzman Macea**

- GitHub: [guzmanmaceajavier-bit](https://github.com/guzmanmaceajavier-bit)
- Demo: [restaurante-hgdsw9piq-javier-1e91.vercel.app](https://restaurante-hgdsw9piq-javier-1e91.vercel.app/demo)
