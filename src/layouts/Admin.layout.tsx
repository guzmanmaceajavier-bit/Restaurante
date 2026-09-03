export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-orange-700 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">Panel Admin</h1>
        <nav className="grid gap-4">
          <a href="/admin/dashboard" className="hover:text-orange-200">
            Reservas
          </a>
          <button
            onClick={() => {
              localStorage.removeItem('adminLogueado')
              window.location.href = '/admin/login'
            }}
            className="mt-8 bg-white text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-100"
          >
            Cerrar sesión
          </button>
        </nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
