import { Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/App.layout'

// Páginas públicas
import Home from '../pages/Home'
import Menu from '../pages/Menu'
import MenuDetail from '../pages/MenuDetail'
import CheckOut from '../pages/CheckOut'
import OrderConfirmation from '../pages/OrderConfirmation'
import Reserve from '../pages/Reserve'
import Contact from '../pages/Contact'
import Resenas from '../pages/Resenas'
import Gallery from '../pages/Gallery'
import Events from '../pages/Events'
import NotFound from '../pages/NotFound'
import MiPerfil from '../pages/MiPerfil'

// Páginas de administración
import GestionReserva from '../pages/GestionReserva'
import AdminReservas from '../pages/AdminReservas'
import AdminOrdenes from '../pages/AdminOrdenes'
import AdminDashboard from '../pages/AdminDashboard'
import OrderHistory from '../pages/OrderHistory'
import Promociones from '../pages/Promociones'
import AdminLogin from '../pages/AdminLogin'
import AdminWhatsApp from '../pages/AdminWhatsApp'

import { RoutesPath } from './routes'

export default function MainRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Rutas Públicas */}
        <Route path={RoutesPath.home} element={<Home />} />
        <Route path={RoutesPath.menu} element={<Menu />} />
        <Route path={RoutesPath.menuDetail(':id')} element={<MenuDetail />} />
        <Route path={RoutesPath.checkout} element={<CheckOut />} />
        <Route path={RoutesPath.orderConfirmation(':id')} element={<OrderConfirmation />} />
        <Route path={RoutesPath.reserve} element={<Reserve />} />
        <Route path={RoutesPath.contact} element={<Contact />} />
        <Route path={RoutesPath.resenas} element={<Resenas />} />
        <Route path={RoutesPath.galeria} element={<Gallery />} />
        <Route path={RoutesPath.eventos} element={<Events />} />
        <Route path={RoutesPath.promociones} element={<Promociones />} />
        <Route path={RoutesPath.miPerfil} element={<MiPerfil />} />

        {/* Rutas de Administración */}
        <Route path={RoutesPath.gestionReserva} element={<GestionReserva />} />
        <Route path={RoutesPath.adminLogin} element={<AdminLogin />} />
        <Route path={RoutesPath.adminReservas} element={<AdminReservas />} />
        <Route path={RoutesPath.adminOrdenes} element={<AdminOrdenes />} />
        <Route path={RoutesPath.adminDashboard} element={<AdminDashboard />} />
        <Route path={RoutesPath.adminWhatsApp} element={<AdminWhatsApp />} />
        <Route path={RoutesPath.orderHistory} element={<OrderHistory />} />

        {/* 404 - debe ir al final */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
