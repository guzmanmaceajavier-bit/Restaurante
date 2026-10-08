# Sabor y Origen

Sistema web completo de gestion y pedidos para restaurante colombiano. Incluye sitio publico, portal de cliente registrado y panel administrativo con 20+ modulos.

**Sitio:** [restaurante-hgdsw9piq-javier-1e91.vercel.app](https://restaurante-hgdsw9piq-javier-1e91.vercel.app/)

---

## Acceso

| Interfaz | Acceso | Descripcion |
|---|---|---|
| Sitio publico | libre | Menu, carrito, checkout, reservas, contacto |
| Portal cliente | registro en `/login` | Pedidos, reservas, favoritos, fidelidad, perfil |
| Panel admin | `admin` / `12345` en `/admin-login` | Dashboard, pedidos, cocina, mesas, inventario, caja, clientes |

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
├── docs/
│   ├── architecture/    # overview, data-layer (modo demo → real)
│   ├── api/             # borrador REST (sin implementar)
│   └── database/        # entidades objetivo
├── public/              # platos/, icons/, manifest.json, sw.js
├── src/
│   ├── app/
│   │   ├── providers/   # AppProviders (router, toasts, cookies, errores)
│   │   └── router/      # rutas (antes src/routes)
│   ├── assets/          # logos, banners, imagenes
│   ├── components/
│   │   ├── ui/          # ProductCard
│   │   ├── feedback/    # ConfirmModal, EmptyState, Skeletons, CookieConsent
│   │   ├── navigation/  # AdminGuard, ScrollToTop, WhatsAppButton, BackToTop
│   │   ├── admin/ cart/ checkout/ home/ menu/ menuDetail/
│   ├── features/        # dominios: auth, products, orders, reservations,
│   │                     # customers, loyalty, promotions, inventory, cash,
│   │                     # billing, reviews, events, tables, finance, activity,
│   │                     # dashboard (types + *.service + index)
│   ├── services/
│   │   ├── api/         # http.ts (cliente REST para futuro backend)
│   │   └── storage/     # adaptadores localStorage por dominio + storageKeys
│   ├── pages/
│   │   ├── public/      # sitio + home/ (10 secciones)
│   │   ├── client/      # login, mi-cuenta, recuperar-contrasena
│   │   └── admin/       # 21 paginas admin
│   ├── layouts/         # PublicLayout, AdminLayout, ClientLayout
│   ├── lib/             # config, initCatalog, seo
│   ├── store/           # Zustand (cart, auth, client, products)
│   ├── hooks/ constants/ utils/ mockData/
│   └── styles/          # index.css (Tailwind)
├── .env.example
├── README.md
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

**Persistencia local / API futura:** los `features/*.service` leen hoy de
`services/storage` (localStorage) y están listos para usar `services/api`
cuando exista el backend, sin cambiar componentes. Detalles en `docs/`.

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
http://localhost:5173/
```

---

## Acceso administrador

| Rol | Usuario | Contrasena |
|---|---|---|
| Administrador | `admin` | `12345` |

Los clientes crean su cuenta en `/login` (registro con email y contraseña).

---

## Decisiones tecnicas

- **Sin backend:** Los datos se persisten en localStorage del navegador. El catalogo inicial se carga desde `mockData/`.
- **Zustand + persist:** El store de autenticacion se sincroniza con localStorage, permitiendo que los datos del cliente (pedidos, reservas, puntos) sobrevivan entre sesiones.
- **Preparado para produccion:** La arquitectura esta diseniada para reemplazar la capa de persistencia local por una API REST sin cambiar la UI.

---

## Autor

Desarrollado por **Javier Guzman Macea**

- GitHub: [guzmanmaceajavier-bit](https://github.com/guzmanmaceajavier-bit)
- Sitio: [restaurante-hgdsw9piq-javier-1e91.vercel.app](https://restaurante-hgdsw9piq-javier-1e91.vercel.app/)
