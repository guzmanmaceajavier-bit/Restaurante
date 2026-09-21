export const DEMO_CONFIG = {
  isDemo: true,
  tagline: 'Demo del sistema — Explora todas las interfaces',
  versions: [
    {
      id: 'public',
      label: 'Sitio web público',
      description: 'Menú, carrito, checkout, reservas, contacto',
      icon: '🌐',
      path: '/',
      color: 'from-[#667A22] to-[#4A5A18]',
    },
    {
      id: 'client',
      label: 'Portal cliente',
      description: 'Mis pedidos, mis reservas, favoritos, fidelidad, perfil',
      icon: '👤',
      path: '/login',
      color: 'from-[#1C2A0F] to-[#2A3D16]',
      credentials: 'cliente@demo.com / Demo123',
    },
    {
      id: 'admin',
      label: 'Panel administrativo',
      description: 'Dashboard, pedidos, cocina, mesas, inventario, caja, clientes',
      icon: '🔐',
      path: '/admin-login',
      color: 'from-espresso-800 to-espresso-900',
      credentials: 'admin / 12345',
    },
  ],
}
