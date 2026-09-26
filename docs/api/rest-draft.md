# Borrador API REST (sin implementar)

Base: `VITE_API_URL`. Respuestas JSON. Auth futura: login → JWT, roles
`ADMIN | MANAGER | EMPLOYEE | CUSTOMER`.

```
GET    /api/products            POST   /api/products
GET    /api/products/:id        PUT    /api/products/:id
DELETE /api/products/:id

GET    /api/orders              POST   /api/orders
GET    /api/orders/:id          PATCH  /api/orders/:id/status

GET    /api/reservations        POST   /api/reservations
PATCH  /api/reservations/:id

GET    /api/customers           POST   /api/customers
GET    /api/customers/:id

GET    /api/promotions          POST   /api/promotions
POST   /api/promotions/validate { codigo }

GET    /api/loyalty/:customerId
POST   /api/loyalty/:customerId/redeem

GET    /api/inventory/low-stock
PATCH  /api/inventory/:productId/stock

GET    /api/cash/movements      POST   /api/cash/movements
GET    /api/cash/expenses       POST   /api/cash/expenses

GET    /api/invoices

GET    /api/reviews             POST   /api/reviews
PATCH  /api/reviews/:id

GET    /api/events              POST   /api/events

POST   /api/auth/login          POST   /api/auth/register
GET    /api/dashboard
```
