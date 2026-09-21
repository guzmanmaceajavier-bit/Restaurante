export function seedDemoData(force = false) {
  const hasOrdenes = localStorage.getItem('ordenes')
  const hasReservas = localStorage.getItem('reservas')
  if (!force && hasOrdenes && hasReservas && JSON.parse(hasOrdenes).length > 5) return

  const now = new Date()
  const iso = (d: Date) => d.toISOString()
  const dateStr = (d: Date) => d.toISOString().split('T')[0]
  const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }

  // Registrar cliente demo en auth-client-storage (Zustand persist)
  try {
    const authRaw = localStorage.getItem('auth-client-storage')
    const auth = authRaw ? JSON.parse(authRaw) : { state: { clientes: [], clienteActual: null }, version: 0 }
    const existing = (auth.state?.clientes || []).find((c: any) => c.email === 'cliente@demo.com')
    if (!existing) {
      const demoCliente = {
        id: 'CLI-DEMO001',
        nombre: 'Laura Gómez',
        email: 'cliente@demo.com',
        telefono: '3157778899',
        password: 'Demo123',
        puntos: 540,
        nivel: 'oro',
        historialPedidos: ['ORD-1001', 'ORD-1002', 'ORD-1003', 'ORD-1004', 'ORD-1005'],
        historialReservas: ['res_100', 'res_101'],
        createdAt: addDays(now, -90).toISOString(),
        direcciones: [
          { id: 'DIR-DEMO1', alias: 'Casa', direccion: 'Calle 15 #5-20, Sahagún', indicaciones: 'Porta azul' },
          { id: 'DIR-DEMO2', alias: 'Oficina', direccion: 'Carrera 7 #12-35, Sahagún', indicaciones: 'Piso 2' },
        ],
      }
      auth.state.clientes = [...(auth.state.clientes || []), demoCliente]
      localStorage.setItem('auth-client-storage', JSON.stringify(auth))
    }
  } catch {}

  // CLIENTES para panel admin
  const clientes = [
    { id:'cli_1', nombre:'María González', telefono:'3101234567', email:'maria@gmail.com', puntos: 320, nivel:'Oro', totalGastado: 890000, pedidos: 18 },
    { id:'cli_2', nombre:'Carlos Pérez', telefono:'3129876543', email:'carlos@hotmail.com', puntos: 85, nivel:'Plata', totalGastado: 310000, pedidos: 7 },
    { id:'cli_3', nombre:'Ana Torres', telefono:'3005551234', email:'ana.torres@gmail.com', puntos: 12, nivel:'Bronce', totalGastado: 54000, pedidos: 2 },
    { id:'cli_4', nombre:'Jorge Díaz', telefono:'3184445566', email:'jorge.diaz@gmail.com', puntos: 210, nivel:'Plata', totalGastado: 620000, pedidos: 14 },
    { id:'cli_5', nombre:'Laura Gómez', telefono:'3157778899', email:'cliente@demo.com', puntos: 540, nivel:'Oro', totalGastado: 1450000, pedidos: 27 },
    { id:'cli_6', nombre:'Felipe Rojas', telefono:'3201112233', email:'felipe.r@gmail.com', puntos: 0, nivel:'Bronce', totalGastado: 0, pedidos: 0 },
  ]
  localStorage.setItem('clientes', JSON.stringify(clientes))
  localStorage.setItem('clientes_admin', JSON.stringify(clientes))

  // PRODUCTOS: ajustar algunos stocks bajos
  try {
    const prods = JSON.parse(localStorage.getItem('productos') || '[]')
    if (prods.length) {
      prods[8].stock = 2 // Cazuela
      prods[19].stock = 0 // Torta Tres Leches agotada
      prods[5].stock = 3
      localStorage.setItem('productos', JSON.stringify(prods))
    }
  } catch {}

  // ORDENES - 18 pedidos distribuidos últimos 7 días
  const estados: any[] = ['recibido','recibido','preparando','preparando','listo','entregado','entregado','entregado','entregado','cancelado']
  const nombres = ['María González','Carlos Pérez','Ana Torres','Jorge Díaz','Laura Gómez','Felipe Rojas','Sofía Martínez','Andrés López']
  const tels = ['3101234567','3129876543','3005551234','3184445566','3157778899','3201112233','3112223344','3198887766']
  const ordenes = Array.from({ length: 18 }).map((_, i) => {
    const diasAtras = i < 5 ? 0 : i < 9 ? 1 : i < 12 ? 2 : Math.floor(Math.random()*7)
    const d = addDays(now, -diasAtras)
    d.setHours(11 + (i % 10), [0,15,30,45][i%4])
    const total = [25000,32000,48000,55000,67000,28000,41000,18500][i%8]
    return {
      id: `ORD-${(1000+i).toString()}`,
      fullName: nombres[i % nombres.length],
      phone: tels[i % tels.length],
      total,
      estado: i < 3 ? 'recibido' : i < 6 ? 'preparando' : estados[i % estados.length],
      createdAt: iso(d),
      tipoServicio: (['delivery','pickup','eatHere'] as const)[i%3],
      metodoPago: (['Efectivo','Nequi','Daviplata','Bancolombia'] as const)[i%4],
      items: [
        { nombre: ['Bandeja Paisa','Ajiaco','Cazuela de Mariscos','Empanadas'][i%4], quantity: 1 + (i%2), precio: total / (1+(i%2)) },
        ...(i%3===0 ? [{ nombre:'Jugo de Lulo', quantity:2, precio: 6000 }] : []),
      ],
    }
  })
  localStorage.setItem('ordenes', JSON.stringify(ordenes))

  // RESERVAS - 12 reservas
  const reservas = Array.from({ length: 12 }).map((_, i) => {
    const dias = i < 4 ? 0 : i < 7 ? 1 : i < 9 ? 2 : 5
    const d = addDays(now, dias)
    return {
      id: `res_${100+i}`,
      nombre: nombres[i % nombres.length],
      email: `cliente${i}@gmail.com`,
      telefono: tels[i % tels.length],
      fecha: dateStr(d),
      hora: `${String(12 + (i%8)).padStart(2,'0')}:${['00','30'][i%2]}`,
      personas: 2 + (i%6),
      zona: (['Interior','Terraza','Barra','Zona Privada'] as const)[i%4],
      ocasion: (['Cumpleaños','Aniversario','Sin ocasión especial'] as const)[i%3],
      estado: (['Pendiente','confirmada','confirmada','rechazada'] as const)[i%4],
      comentarios: i%4===0 ? 'Mesa cerca a ventana por favor' : '',
      createdAt: iso(addDays(now, -1)),
    }
  })
  localStorage.setItem('reservas', JSON.stringify(reservas))

  // RESENAS
  const resenas = [
    { id:'rev1', nombre:'María González', rating:5, comentario:'Excelente bandeja paisa y atención. Volveremos!', fecha: iso(addDays(now,-2)), estado:'publicada' },
    { id:'rev2', nombre:'Carlos Pérez', rating:4, comentario:'Muy buen sabor, un poco de demora en hora pico.', fecha: iso(addDays(now,-5)), estado:'publicada' },
    { id:'rev3', nombre:'Laura Gómez', rating:5, comentario:'La cazuela de mariscos increíble. Recomendado 100%.', fecha: iso(addDays(now,-1)), estado:'publicada' },
    { id:'rev4', nombre:'Jorge Díaz', rating:3, comentario:'Bueno pero el domicilio llegó frío.', fecha: iso(addDays(now,-3)), estado:'pendiente' },
  ]
  localStorage.setItem('resenas', JSON.stringify(resenas))
  localStorage.setItem('resenas_admin', JSON.stringify(resenas))

  // MESAS - ocupar algunas
  try {
    const mesas = JSON.parse(localStorage.getItem('mesas') || '[]')
    if (mesas.length) {
      mesas[0].estado = 'ocupada'
      mesas[1].estado = 'reservada'
      mesas[3].estado = 'ocupada'
      localStorage.setItem('mesas', JSON.stringify(mesas))
    }
  } catch {}

  // CAJA / GASTOS / COMPRAS / PROVEEDORES ya tienen datos base; agregar movimientos demo
  localStorage.setItem('caja_movs', JSON.stringify([
    { id:'mov1', tipo:'egreso', concepto:'Compra insumos plaza', monto: 85000, metodo:'Efectivo', fecha: dateStr(now) },
    { id:'mov2', tipo:'ingreso', concepto:'Propina en efectivo', monto: 24000, metodo:'Efectivo', fecha: dateStr(now) },
  ]))
  localStorage.setItem('gastos', JSON.stringify([
    { id:'g1', categoria:'Insumos', descripcion:'Compra carnes y verduras plaza', monto: 320000, fecha: dateStr(addDays(now,-1)), responsable:'Javier' },
    { id:'g2', categoria:'Servicios', descripcion:'Gas - recarga', monto: 85000, fecha: dateStr(now), responsable:'Javier' },
    { id:'g3', categoria:'Nómina', descripcion:'Pago auxiliar cocina semana', monto: 450000, fecha: dateStr(addDays(now,-2)), responsable:'Gerencia' },
  ]))
  localStorage.setItem('compras', JSON.stringify([
    { id:'comp_1', proveedor:'Distribuciones La Sabana', productos:'Arroz 10kg, Pollo 5kg', cantidad:15, total: 185000, fecha: dateStr(addDays(now,-1)), estado:'recibida' },
    { id:'comp_2', proveedor:'Frutas del Valle', productos:'Lulo 8kg, Maracuyá 5kg', cantidad:13, total: 95000, fecha: dateStr(now), estado:'pendiente' },
  ]))

  // ACTIVIDAD
  localStorage.setItem('activity_log', JSON.stringify([
    { id:'act1', accion:'Pedidos', detalle:'Pedido ORD-1001 cambiado a preparando', fecha: iso(now), usuario:'Admin' },
    { id:'act2', accion:'Reservas', detalle:'Reserva res_101 confirmada', fecha: iso(addDays(now,0)), usuario:'Admin' },
    { id:'act3', accion:'Inventario', detalle:'Stock Cazuela ajustado a 2', fecha: iso(addDays(now,-1)), usuario:'Admin' },
  ]))

  localStorage.setItem('demo_seeded', 'true')
}
