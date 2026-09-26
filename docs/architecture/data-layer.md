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

## Migrado a adaptadores / services

`lib/storage.ts`, `lib/dataService.ts` (lecturas de catálogo/promos),
`lib/config.ts` (restaurant-config), `lib/activity.ts`, `lib/seedDemo.ts`,
`store/useProductStore`, `store/useClientStore`, `store/useAuthStore`,
`pages/client/ClientLogin.tsx` (demo login).

## Pilotos migrados a domain services (0 localStorage directo)

- `pages/admin/AdminCaja.tsx` → `features/cash/cash.service.ts`
  (resumen con anti-doble-conteo, apertura/cierre, registrar/actualizar/eliminar
  movimientos, ventas del día).
- `pages/admin/AdminCatalogo.tsx` → `features/products/product.service.ts`
  (CRUD, filtros, paginación, categorías con validaciones) +
  `features/inventory/inventory.service.ts` (stock, estado Agotado/Bajo/OK).
- `pages/admin/AdminOrdenes.tsx` → `features/orders/order.service.ts`
  (filtros+orden, `buildHistory`, `cambiarEstado` con compensación de stock y
  auditoría, etiquetas de estado). `deleteCategoria` ahora opera sobre la lista
  pasada por la página, no sobre la guardada.
- `pages/admin/AdminReservas.tsx` → `features/reservations/reservation.service.ts`
  (filtros, crear/actualizar/cambiar-estado/eliminar con validación) +
  `features/customers/customer.service.ts#linkReserva` (historial en lista
  admin + sesión del portal).
- `pages/admin/AdminMesas.tsx` → `features/tables/table.service.ts`
  (nuevo dominio salón: seed, stats, guardar con validaciones, cambio de
  estado con `occupiedSince`, eliminar).
- `pages/admin/AdminCocina.tsx` → `features/orders/order.service.ts`
  (`filterCocina`, `avanzarPedido` sin historial, igual que el KDS original).
- `pages/client/ClientPanel.tsx` → `features/customers/customer.service.ts`
  (mis pedidos/reservas, huérfanos, vincular, preferencias),
  `features/reservations/` (cancelar/modificar del portal),
  `features/orders/order.service.ts#cancelarPedido`,
  `features/loyalty/loyalty.service.ts` (recompensas, canjes, historial),
  `features/products/product.service.ts` (favoritos).
- `pages/client/ClientLogin.tsx` (demo vía `authStorage`),
  `pages/public/{MiPerfil,OrderHistory,OrderTracking}.tsx`,
  `hooks/useFavorites.ts` (vía `authStorage`).
- `pages/admin/AdminFacturacion.tsx` → `features/billing/billing.service.ts`
  (facturas no canceladas ordenadas, total facturado).
- `pages/admin/AdminCompras.tsx` → `features/inventory/purchase.service.ts`
  (filtros, registro con validación + suma de stock si recibida,
  cambio de estado, eliminar) + `supplier.service` (lectura).
- `pages/admin/AdminProveedores.tsx` → `features/inventory/supplier.service.ts`
  (seed, filtros, guardar con validación, eliminar).
- `pages/admin/AdminFinanzas.tsx` → `features/finance/analytics.service.ts`
  (nuevo dominio finanzas: filtros por rango, stats, ventas 7 días,
  métodos de pago, top productos, pedidos por estado).

## Pendiente (acceso directo en componentes, migrar a features/*.service)

`Reserve`, `ClientPanel`, `CheckOutView`, `AdminWhatsApp`, `AdminUsuarios`,
`AdminReservas`, `AdminProveedores`, `AdminPromociones`, `AdminOrdenes`,
`AdminMesas`, `AdminFinanzas`, `AdminFidelizacion`, `AdminDashboard`,
`AdminConfig`, `AdminCompras`, `AdminClientes`,
`Contact`, `Testimonials`, `FAQ`, `useFavorites`, `AdminLayout` (`admin_collapsed`).
