# Arquitectura

## Modo actual: DEMO

```
React + TypeScript
  → features/*.service (fachadas por dominio)
    → services/storage/* (adaptadores localStorage, claves en storageKeys.ts)
      → localStorage
  → Zustand persist (cart, auth-client, client, products)
```

Los componentes NO deberían acceder a `localStorage` directamente: deben usar
`features/<dominio>/*.service` o `services/storage/*`. La migración de páginas
es progresiva (ver `data-layer.md`).

## Modo objetivo: REAL

```
React → features/*.service → services/api/http.ts → REST API → backend → DB
```

Cada `*.service` cambia su implementación interna a `http.get/post/put/remove`
sin modificar componentes. `VITE_API_URL` y `VITE_DEMO_MODE` en `.env`
(ver `.env.example`).

## Mapa de módulos

| Área | Rutas | Layout |
|---|---|---|
| Pública | `/`, `/menu`, `/checkout`, `/reservas`, `/contacto`, `/demo`, … | `layouts/PublicLayout.tsx` |
| Cliente | `/login`, `/registro`, `/mi-cuenta`, `/recuperar-contrasena` | `layouts/ClientLayout.tsx` |
| Admin | `/admin-*` (20 rutas, guard `AdminGuard`) | `layouts/AdminLayout.tsx` |

`src/pages/{public,client,admin}/`, `src/features/*` (12 dominios),
`src/app/{router,providers}/`, `src/components/{ui,feedback,navigation,…}`.

## Decisiones

- La raíz del repo sigue siendo el frontend (Vercel despliega desde `/`).
  La división `frontend/` + `backend/` se hará al crear el backend,
  moviendo este árbol intacto a `frontend/`.
- `lib/` queda como núcleo compartido (config, dataService compat, seedDemo).
- Sin dependencias nuevas en esta fase.
