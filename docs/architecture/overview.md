# Arquitectura

## Modo actual: persistencia local

```
React + TypeScript
  → features/*.service (fachadas por dominio)
    → services/storage/* (adaptadores localStorage, claves en storageKeys.ts)
      → localStorage
  → Zustand persist (cart, auth-client, client, products)
```

Pages, components, hooks y layouts: 0 accesos directos a `localStorage`
(verificado por búsqueda). Todo acceso pasa por `features/*` o `services/*`.

## Modo objetivo: API real

```
React → features/*.service → services/api/http.ts → REST API → backend → DB
```

Cada `*.service` cambia su implementación interna a `http.get/post/put/remove`
sin modificar componentes. `VITE_API_URL` en `.env` (ver `.env.example`).

## Mapa de módulos

| Área | Rutas | Layout |
|---|---|---|
| Pública | `/`, `/menu`, `/checkout`, `/reservas`, `/contacto`, … | `layouts/PublicLayout.tsx` |
| Cliente | `/login`, `/registro`, `/mi-cuenta`, `/recuperar-contrasena` | `layouts/ClientLayout.tsx` |
| Admin | `/admin-*` (guard `AdminGuard`, credenciales en `/admin-login`) | `layouts/AdminLayout.tsx` |

`src/pages/{public,client,admin}/`, `src/features/*`,
`src/app/{router,providers}/`, `src/components/{ui,feedback,navigation,…}`.

## Decisiones

- La raíz del repo sigue siendo el frontend (Vercel despliega desde `/`).
  La división `frontend/` + `backend/` se hará al crear el backend,
  moviendo este árbol intacto a `frontend/`.
- `lib/` queda como núcleo compartido (config, initCatalog, seo).
- Sin cuentas demo: el cliente se registra, el admin usa sus credenciales.
