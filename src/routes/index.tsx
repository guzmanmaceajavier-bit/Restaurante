import { Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/App.layout'
import AdminLayout from '../layouts/AdminLayout'
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
import OrderTracking from '../pages/OrderTracking'
import AboutUs from '../pages/AboutUs'
import ForgotPassword from '../pages/ForgotPassword'

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
import AdminConfig from '../pages/AdminConfig'
import AdminCategorias from '../pages/AdminCategorias'
import AdminPromociones from '../pages/AdminPromociones'
import AdminInventario from '../pages/AdminInventario'
import AdminFinanzas from '../pages/AdminFinanzas'
import AdminReportes from '../pages/AdminReportes'
import AdminSegmentacion from '../pages/AdminSegmentacion'
import AdminActividad from '../pages/AdminActividad'
import AdminBackup from '../pages/AdminBackup'
import AdminHorarios from '../pages/AdminHorarios'

import { RoutesPath } from './routes'

export default function MainRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AppLayout />}>
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
        <Route path={RoutesPath.orderTrackingBase} element={<OrderTracking />} />
        <Route path={RoutesPath.orderTracking(':id')} element={<OrderTracking />} />
        <Route path={RoutesPath.aboutUs} element={<AboutUs />} />
        <Route path={RoutesPath.forgotPassword} element={<ForgotPassword />} />
      </Route>

      {/* Admin login */}
      <Route path={RoutesPath.adminLogin} element={<AdminLogin />} />

      {/* Admin routes with sidebar */}
      <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route path={RoutesPath.adminDashboard} element={<AdminDashboard />} />
        <Route path={RoutesPath.gestionReserva} element={<GestionReserva />} />
        <Route path={RoutesPath.adminReservas} element={<AdminReservas />} />
        <Route path={RoutesPath.adminOrdenes} element={<AdminOrdenes />} />
        <Route path={RoutesPath.adminWhatsApp} element={<AdminWhatsApp />} />
        <Route path={RoutesPath.adminProductos} element={<AdminProductos />} />
        <Route path={RoutesPath.adminClientes} element={<AdminClientes />} />
        <Route path={RoutesPath.adminResenas} element={<AdminResenas />} />
        <Route path={RoutesPath.adminCocina} element={<AdminCocina />} />
        <Route path={RoutesPath.adminMesas} element={<AdminMesas />} />
        <Route path="/admin-config" element={<AdminConfig />} />
        <Route path={RoutesPath.adminCategorias} element={<AdminCategorias />} />
        <Route path={RoutesPath.adminPromociones} element={<AdminPromociones />} />
        <Route path={RoutesPath.adminInventario} element={<AdminInventario />} />
        <Route path={RoutesPath.adminFinanzas} element={<AdminFinanzas />} />
        <Route path={RoutesPath.adminReportes} element={<AdminReportes />} />
        <Route path={RoutesPath.adminSegmentacion} element={<AdminSegmentacion />} />
        <Route path={RoutesPath.adminActividad} element={<AdminActividad />} />
        <Route path={RoutesPath.adminBackup} element={<AdminBackup />} />
        <Route path={RoutesPath.adminHorarios} element={<AdminHorarios />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
