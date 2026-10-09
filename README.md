# Sabor y Origen

Sistema web para un restaurante colombiano: sitio público con menú y pedidos en línea, portal de clientes con fidelización, y panel administrativo para operar el negocio (pedidos, cocina, mesas, inventario, caja y clientes).

**Sitio en producción:** https://restaurante-javier-1e91.vercel.app/

---

## Cómo entrar

| Quién | Dónde | Acceso |
|---|---|---|
| Cliente | [/login](https://restaurante-javier-1e91.vercel.app/login) | Se registra con nombre, email, teléfono y contraseña |
| Administrador | [/admin-login](https://restaurante-javier-1e91.vercel.app/admin-login) | Usuario `admin` · Clave `12345` |

---

## Qué incluye

**Sitio público**
- Menú de 25 platos con fotos, buscador, filtros por categoría/precio/tiempo/picante y ordenamiento
- Carrito con cupones de descuento y checkout (domicilio, recoger o en mesa)
- Reservas por pasos con calendario, zonas y disponibilidad por horario
- Promociones, eventos, galería, reseñas, contacto y seguimiento de pedidos

**Portal del cliente** (`/mi-cuenta`)
- Pedidos con seguimiento, repetición y cancelación
- Reservas: crear, modificar y cancelar
- Favoritos, direcciones guardadas y programa de puntos (bronce/plata/oro)
- Perfil, descarga de datos y eliminación de cuenta

**Panel admin** (`/admin-*`, 22 módulos)
- Operación: dashboard, pedidos, cocina (kanban), reservas, mesas
- Catálogo: productos, categorías, stock, compras y proveedores
- Finanzas: caja, facturación y analítica
- Clientes: base unificada, fidelización, reseñas y WhatsApp masivo
- Sistema: usuarios y roles, actividad, configuración y legales editables

---

## Capturas

> Carpeta sugerida: `docs/screenshots/` (aún sin imágenes).
-inicio
<img width="1355" height="619" alt="image" src="https://github.com/user-attachments/assets/7a3c5e15-26fb-4352-a65a-a3b2ef581765" />

-menú
<img width="1354" height="609" alt="image" src="https://github.com/user-attachments/assets/c99898e1-3f4d-4bfc-9567-d207d6b17582" />
-carrito
- <img width="446" height="616" alt="image" src="https://github.com/user-attachments/assets/9ce6e471-199f-456a-9b99-47133695b27e" />

Pendientes en `docs/screenshots/`: `mi-cuenta.png`, `admin-dashboard.png`, `admin-cocina.png`, `reservas.png`.

---

## Decisiones técnicas

- **Sin backend (por ahora):** los datos viven en el `localStorage` del navegador. El catálogo inicial sale de `src/mockData/mock_data.json`.
- **Capas separadas:** las páginas consumen `features/*.service`, y esos servicios leen `services/storage/*`. Para conectar una API real solo hay que cambiar los services, sin tocar la interfaz.
- **Estado con Zustand** (carrito, autenticación, clientes, catálogo) con persistencia entre sesiones.
- **Formularios con Formik + Yup**, animaciones con Framer Motion, iconos con React Icons.

---

## Estructura

```
restaurante/
├── docs/               # arquitectura, api (borrador), base de datos (entidades)
├── public/             # fotos de platos, iconos PWA, manifest, service worker
├── src/
│   ├── app/            # providers + router
│   ├── assets/         # logos, banners
│   ├── components/     # ui, feedback, navigation, admin, cart, checkout, menu...
│   ├── features/       # lógica por dominio (pedidos, caja, clientes...)
│   ├── services/       # api (cliente REST futuro) + storage (adaptadores)
│   ├── pages/          # public/ · client/ · admin/
│   ├── layouts/        # PublicLayout, ClientLayout, AdminLayout
│   ├── lib/            # config, initCatalog, seo
│   ├── store/          # Zustand (cart, auth, client, products)
│   ├── hooks/ constants/ utils/ mockData/
│   └── styles/         # index.css (Tailwind)
├── .env.example
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## Instalación

```bash
git clone https://github.com/guzmanmaceajavier-bit/Restaurante.git
cd Restaurante
npm install
npm run dev
# http://localhost:5173/
```

Build de producción: `npm run build` (`tsc -b && vite build`).

---

## Tecnologías

React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 · Zustand 4 · Formik + Yup · Framer Motion 10 · React Router 6 · Sonner · React Icons

---

## Autor

**Javier Guzmán Macea** — [guzmanmaceajavier-bit](https://github.com/guzmanmaceajavier-bit)
