---
name: fix-restaurante
description: Use when fixing Sabor y Origen restaurant project — inventory/stock duplication, client isolation, portal navigation, Vite HMR, localStorage sync. Triggers on "arregla proyecto", "fix restaurante", "inventario stock duplicado", "aislamiento cliente", "menu no funciona".
---

# Fix Restaurante — Sabor y Origen

Skill para reparar y verificar el proyecto `restaurante` (React 18 + Vite 5 + Zustand + Tailwind + localStorage).

## Cuándo usar
- Usuario dice "arregla proyecto", "skill que arregle este proyecto", "inventario/stock duplicado", "aislamiento cliente", "menu no funciona / hay dos menus", "portal cliente no navega sin recarga".

## Diagnóstico rápido
1. `npx tsc --noEmit --skipLibCheck` debe pasar sin errores.
2. `npx vite --host --port 5173 --force` debe quedar `VITE ready` y `netstat -ano | findstr 5173` LISTENING.
3. `Invoke-WebRequest http://localhost:5173/src/pages/ClientPanel.tsx` debe dar `200`, no `500`.
4. Revisar `localStorage` keys: `productos` (stock), `ordenes`, `reservas`, `auth-client-storage` (clientes + historial), `restaurant-config`.

## Fixes registrados

### 1. Inventario/Stock duplicado
- Fuente única: `localStorage 'productos'::stock`.
- `src/pages/AdminCatalogo.tsx:14` tab `inventario` con edición inline `editingStockId/editStockValue/saveStock()` (Enter/blur).
- `src/pages/AdminInventario.tsx:1` ahora wrapper que redirige `toast` → `/admin-catalogo#inventario` en 900ms.
- `src/layouts/AdminLayout.tsx:27` INVENTARIO → `Stock` link `/admin-catalogo#inventario`. Soporta `window.location.hash` en Catalogo.

### 2. Aislamiento cliente
- Antes filtraba por `historial || phone || email || nombre` → leak.
- Ahora `src/pages/ClientPanel.tsx:66` solo `historialPedidos/historialReservas` (estricto por `clienteActual.id`).
- Banner `showVincular` opt-in para huérfanos por `phone/email` → `addOrderToHistory/addReservaToHistory`.
- `src/store/useAuthStore.ts:15` `direcciones[]` por `id`, `favoritos` por `telefono` único, `prefs_{id}` por cliente.

### 3. Portal cliente — doble menú y navegación sin recarga
- Eliminado pills superior `ClientPanel` (`flex gap-1.5 overflow-x-auto`), queda solo sidebar `240px` `ClientLayout.tsx:7`.
- Sidebar activo por `activeHash` (`useState + hashchange + location`) → `bg #1C2A0F text-white` + `icon #F5B51B`.
- `ClientPanel` usa `useLocation().hash` para `setTab` sin `F5` (`src/pages/ClientPanel.tsx:90`). Botones internos (`Gestionar`, `Ver recompensas`) hacen `window.location.hash='...'`.

### 4. Vite / HMR
- `vite.config.ts:16` `dedupe ['react','react-dom']` + `hmr.overlay:false` + `port 5173 host:true`.
- `public/sw.js` v5 bypassa `@vite/src/node_modules` para no cachear HMR.

## Verificación tras fix
```bash
npx tsc --noEmit --skipLibCheck
# y
Start-Process cmd "/c cd /d %CD% && npx vite --host --port 5173 --force > %TEMP%\vite.log 2>&1"
# luego
Invoke-WebRequest http://localhost:5173/src/pages/ClientPanel.tsx # 200
Invoke-WebRequest http://localhost:5173/src/layouts/ClientLayout.tsx # 200
```

## Commit
Cada fix hace `git add -A; git commit -m "fix(...)" --no-verify; git push origin main`.

Tras crear/editar este skill, **reinicia opencode** para que lo cargue (`skills` no es hot-reload).
