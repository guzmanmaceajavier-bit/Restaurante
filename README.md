# Sabor y Origen

## Descripción

**Sabor y Origen** es una plataforma web integral para restaurantes que permite gestionar menú, pedidos, reservas, promociones y administración desde un solo lugar.

## Acceso

### Panel de Administración

- **Ruta:** `/admin-login`
- **Usuario:** `admin`
- **Contraseña:** `12345`

### Panel de Cliente

- **Ruta:** `/login`
- Los clientes se registran e inician sesión con email y contraseña.
- Todo se guarda en `localStorage` del navegador.

## Stack tecnológico

- React 18 + TypeScript
- Vite
- Tailwind CSS 3.4
- Zustand (estado)
- React Router v6
- Formik + Yup (formularios)
- Sonner (notificaciones)
- React Icons

## Funcionalidades

### Cliente
- Menú interactivo con búsqueda, filtros y categorías
- Carrito de compras
- Pedido para llevar, recoger o consumir en restaurante
- Reserva de mesa con calendario inteligente
- Panel de cliente (perfil, pedidos, reservas, favoritos)
- Integración con WhatsApp

### Administración
- Dashboard con estadísticas
- Gestión de productos y categorías
- Gestión de pedidos y estados
- Gestión de reservas
- Gestión de mesas
- Gestión de clientes
- Gestión de promociones y códigos
- Gestión de reseñas
- Panel de cocina
- Integración con WhatsApp

## Instalación

```bash
npm install
npm run dev
```

## Producción

```bash
npm run build
```

## Datos

Todos los datos se guardan en `localStorage` del navegador. No hay backend.
