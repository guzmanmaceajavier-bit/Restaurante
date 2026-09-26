# Entidades objetivo (derivadas del localStorage actual)

```
users (id, nombre, email, password_hash, rol, estado, created_at, updated_at)
customers (id, user_id?, nombre, email, telefono, puntos, nivel, created_at)
  → orders (id, customer_id?, full_name, phone, type, subtotal, delivery_fee,
            total, payment_method, estado, created_at)
    → order_items (id, order_id, product_id?, nombre, quantity, precio)
  → reservations (id, customer_id?, fecha, hora, personas, zona, ocasion, estado)
  → loyalty_accounts (customer_id, puntos, nivel)
  → loyalty_transactions (id, customer_id, order_id?, delta, motivo, created_at)
  → reviews (id, customer_id?, rating, comentario, estado, created_at)
products (id, nombre, descripcion, precio, categoria, imagen, stock, …)
categories (id, nombre)
promotions (id, titulo, descripcion, descuento, codigo?, vigente)
tables (id, nombre, capacidad, zona, estado)
  → reservation_tables (reservation_id, table_id)
purchases (id, supplier_id?, detalle, total, estado, fecha)
  → purchase_items (id, purchase_id, producto, cantidad, costo)
suppliers (id, nombre, contacto)
inventory_movements (id, product_id, tipo, cantidad, motivo, created_at)
cash_movements (id, tipo, concepto, monto, metodo, fecha)
expenses (id, categoria, descripcion, monto, fecha, responsable)
invoices (id, order_id, numero, total, fecha)
events (id, titulo, descripcion, icono, activo)
activity_logs (id, accion, detalle, usuario, fecha)
restaurant_settings (clave, valor)
```

Relación principal: `CUSTOMER → ORDERS → ORDER_ITEMS → PRODUCTS`,
`CUSTOMER → RESERVATIONS / LOYALTY / REVIEWS`.
