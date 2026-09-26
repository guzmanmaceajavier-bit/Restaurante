# Capa de datos (modo demo)

## Claves centralizadas

Todas viven en `services/storage/storageKeys.ts` (los valores no deben cambiar).

| Dominio | Claves |
|---|---|
| Catálogo | `productos`, `categorias`, `products-storage` |
| Pedidos | `ordenes` |
| Reservas/mesas | `reservas`, `mesas` |
| Clientes | `clientes`, `clientes_admin`, `auth-client-storage`, `client-storage` |
| Fidelidad | `fidelizacion_cfg`, `fidelizacion_recompensas`, `fidelidad_historial_<id>`, `prefs_<id>`, `sabor-favorites-<tel>` |
| Caja/compras | `caja_movs`, `gastos`, `caja_abierta`, `caja_apertura`, `compras`, `proveedores` |
| Contenido | `resenas`, `resenas_admin`, `eventos_admin`, `contact-reviews`, `home_faq`, `home_testimonials` |
| Sistema | `isAdmin`, `adminName`, `activity_log`, `restaurant-config`, `usuarios_roles`, `whatsapp-historial`, `admin_collapsed`, `cookie-consent-accepted`, `demo_seeded`, `politica-privacidad-text`, `terminos-condiciones-text`, `cart-storage` |

## Migrado a adaptadores

`lib/storage.ts`, `lib/dataService.ts` (lecturas de catálogo/promos),
`lib/config.ts` (restaurant-config), `lib/activity.ts`, `lib/seedDemo.ts`,
`store/useProductStore`, `store/useClientStore`, `store/useAuthStore`,
`pages/client/ClientLogin.tsx` (demo login).

## Pendiente (acceso directo en componentes, migrar a features/*.service)

`Reserve`, `ClientPanel`, `CheckOutView`, `AdminWhatsApp`, `AdminUsuarios`,
`AdminReservas`, `AdminProveedores`, `AdminPromociones`, `AdminOrdenes`,
`AdminMesas`, `AdminFinanzas`, `AdminFidelizacion`, `AdminDashboard`,
`AdminConfig`, `AdminCompras`, `AdminClientes`, `AdminCatalogo`, `AdminCaja`,
`Contact`, `Testimonials`, `FAQ`, `useFavorites`, `AdminLayout` (`admin_collapsed`).
