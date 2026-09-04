import { Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/App.layout'
import { AdminGuard } from '../components/core/AdminGuard'

// Public pages
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
import PoliticaPrivacidad from '../pages/PoliticaPrivacidad'
import TerminosCondiciones from '../pages/TerminosCondiciones'
import ClientLogin from '../pages/ClientLogin'
import ClientPanel from '../pages/ClientPanel'

// Admin pages
import GestionReserva from '../pages/GestionReserva'
import AdminReservas from '../pages/AdminReservas'
import AdminOrdenes from '../pages/AdminOrdenes'
import AdminDashboard from '../pages/AdminDashboard'
import OrderHistory from '../pages/OrderHistory'
import Promociones from '../pages/Promociones'
import AdminLogin from '../pages/AdminLogin'
import AdminWhatsApp from '../pages/AdminWhatsApp'
import AdminProductos from '../pages/AdminProductos'
import AdminClientes from '../pages/AdminClientes'
import AdminResenas from '../pages/AdminResenas'
import AdminCocina from '../pages/AdminCocina'
import AdminMesas from '../pages/AdminMesas'

import { RoutesPath } from './routes'

export default function MainRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public routes */}
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
        <Route path={RoutesPath.orderHistory} element={<OrderHistory />} />
        <Route path={RoutesPath.politicaPrivacidad} element={<PoliticaPrivacidad />} />
        <Route path={RoutesPath.terminosCondiciones} element={<TerminosCondiciones />} />
        <Route path={RoutesPath.clientLogin} element={<ClientLogin />} />
        <Route path={RoutesPath.clientRegister} element={<ClientLogin />} />
        <Route path={RoutesPath.clientPanel} element={<ClientPanel />} />

        {/* Admin routes */}
        <Route path={RoutesPath.adminLogin} element={<AdminLogin />} />
        <Route path={RoutesPath.gestionReserva} element={<AdminGuard><GestionReserva /></AdminGuard>} />
        <Route path={RoutesPath.adminReservas} element={<AdminGuard><AdminReservas /></AdminGuard>} />
        <Route path={RoutesPath.adminOrdenes} element={<AdminGuard><AdminOrdenes /></AdminGuard>} />
        <Route path={RoutesPath.adminDashboard} element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path={RoutesPath.adminWhatsApp} element={<AdminGuard><AdminWhatsApp /></AdminGuard>} />
        <Route path={RoutesPath.adminProductos} element={<AdminGuard><AdminProductos /></AdminGuard>} />
        <Route path={RoutesPath.adminClientes} element={<AdminGuard><AdminClientes /></AdminGuard>} />
        <Route path={RoutesPath.adminResenas} element={<AdminGuard><AdminResenas /></AdminGuard>} />
        <Route path={RoutesPath.adminCocina} element={<AdminGuard><AdminCocina /></AdminGuard>} />
        <Route path={RoutesPath.adminMesas} element={<AdminGuard><AdminMesas /></AdminGuard>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
